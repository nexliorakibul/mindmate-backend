import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB URI: ${error.message}`);
        console.log('⚠️  Falling back to In-Memory Database...');

        try {
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            const conn = await mongoose.connect(uri);
            console.log(`✅ MongoDB InMemory Connected: ${conn.connection.host}`);
            console.log('⚠️  Note: Data will be lost when the server restarts.');
        } catch (memError) {
            console.error(`Fatal Error: Could not start in-memory DB: ${memError.message}`);
            process.exit(1);
        }
    }
};

export default connectDB;
