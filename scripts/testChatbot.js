#!/usr/bin/env node

/**
 * Chatbot Diagnostics Script
 * Tests OpenAI connection and reports issues
 * 
 * Usage: node scripts/testChatbot.js
 */

import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const log = {
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
    header: (msg) => console.log(`\n${colors.blue}${msg}${colors.reset}`),
};

async function test() {
    log.header('🔍 MindMate Chatbot Diagnostics');
    console.log('');

    // 1. Check environment variables
    log.header('1. Environment Configuration');
    
    if (!process.env.OPENAI_API_KEY) {
        log.error('OPENAI_API_KEY not set in .env');
        log.info('Set it with: OPENAI_API_KEY=sk-your-key-here');
        process.exit(1);
    } else {
        const maskedKey = process.env.OPENAI_API_KEY.substring(0, 8) + '...' + process.env.OPENAI_API_KEY.substring(-4);
        log.success(`OPENAI_API_KEY found: ${maskedKey}`);
    }

    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    log.success(`OPENAI_MODEL: ${model}`);

    // 2. Validate API key format
    log.header('2. API Key Validation');
    
    if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
        log.error('API Key does not start with "sk-"');
        log.info('Valid OpenAI keys start with "sk-"');
        process.exit(1);
    } else {
        log.success('API Key format is valid');
    }

    // 3. Test OpenAI connection
    log.header('3. Testing OpenAI Connection');
    
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        log.info('Sending test message to OpenAI...');
        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant. Respond with exactly: "OpenAI connection successful!"'
                },
                {
                    role: 'user',
                    content: 'Test message'
                }
            ],
            max_tokens: 50,
        });

        const reply = response.choices[0].message.content;
        log.success(`OpenAI responded: "${reply}"`);
        log.success('✅ Connection test passed!');

    } catch (error) {
        log.error(`OpenAI connection failed: ${error.message}`);
        
        if (error.status === 401) {
            log.error('Invalid API Key or authentication failed');
            log.info('Check your OPENAI_API_KEY in .env');
        } else if (error.status === 429) {
            log.error('Quota exceeded - you have hit your usage limit');
            log.info('Visit https://platform.openai.com/account/billing/overview');
        } else if (error.status === 403) {
            log.error('API access forbidden - check your account permissions');
        } else if (error.status === 503) {
            log.error('OpenAI service temporarily unavailable - try again later');
        }
        
        process.exit(1);
    }

    // 4. Model availability
    log.header('4. Model Information');
    log.success(`Using model: ${model}`);
    log.info('Cost: $0.0005 per 1K input tokens, $0.0015 per 1K output tokens');

    // 5. Summary
    log.header('✅ All Diagnostics Passed!');
    log.success('Your chatbot is ready to use');
    console.log('');
    log.info('Next steps:');
    console.log('  1. Start backend: npm start');
    console.log('  2. Start frontend: cd frontend && npm run dev');
    console.log('  3. Open http://localhost:5173');
    console.log('');
}

test().catch(err => {
    log.error(`Unexpected error: ${err.message}`);
    process.exit(1);
});
