import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
    console.log('Testing OpenAI connection...');
    try {
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'Hello, are you working?' }],
            max_tokens: 10,
        });
        console.log('Success! Response:', completion.choices[0].message.content);
    } catch (error) {
        console.error('OpenAI Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testOpenAI();
