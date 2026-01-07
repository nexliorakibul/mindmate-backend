import admin from '../config/firebase.js';

const createTestUser = async () => {
    const email = 'test@mindmate.com';
    const password = 'password123';

    try {
        // Check if user exists
        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            console.log('Test user already exists:');
            console.log(`Email: ${email}`);
            console.log(`Password: ${password} (If you didn't change it)`);
            process.exit(0);
        } catch (error) {
            if (error.code !== 'auth/user-not-found') {
                throw error;
            }
        }

        // Create user
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            emailVerified: true,
            displayName: 'Test User',
        });

        console.log('Successfully created new user:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`UID: ${userRecord.uid}`);
        process.exit(0);

    } catch (error) {
        console.error('Error creating new user:', error);
        process.exit(1);
    }
};

createTestUser();
