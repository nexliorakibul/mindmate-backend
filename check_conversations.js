import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from './models/Conversation.js';

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const convs = await Conversation.find({});
        console.log(`Found ${convs.length} conversations.`);
        console.log(JSON.stringify(convs, null, 2));

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkDB();
