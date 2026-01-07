import app from './app.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5001;

// Validate critical environment variables
const validateConfig = () => {
    const requiredVars = {
        'OPENAI_API_KEY': 'OpenAI API Key',
        'MONGO_URI': 'MongoDB Connection URI',
        'FIREBASE_PROJECT_ID': 'Firebase Project ID',
        'FIREBASE_CLIENT_EMAIL': 'Firebase Client Email',
        'FIREBASE_PRIVATE_KEY': 'Firebase Private Key'
    };

    const missingVars = Object.entries(requiredVars)
        .filter(([key]) => !process.env[key])
        .map(([, label]) => label);

    if (missingVars.length > 0) {
        console.warn('⚠️  WARNING: Missing environment variables:');
        missingVars.forEach(v => console.warn(`  - ${v}`));
        console.warn('\n📝 See .env.example for setup instructions');
        console.warn('⚠️  App will run but some features may not work properly\n');
    }

    // Validate OpenAI API key format
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')) {
        console.warn('⚠️  WARNING: Invalid OpenAI API Key format!');
        console.warn('   API Key should start with "sk-"');
        console.warn('   AI features will likely fail.\n');
    }

    console.log('✅ Environment variables validated');
};

// Validate config before starting
validateConfig();

// Connect to Database
connectDB();

const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📝 OpenAI Model: ${process.env.OPENAI_MODEL || 'gpt-3.5-turbo'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
