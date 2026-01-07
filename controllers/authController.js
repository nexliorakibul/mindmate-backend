import User from '../models/User.js';

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
    try {
        // req.user is populated by verifyFirebaseToken middleware
        const { uid, email } = req.user;

        // Check if user exists in our DB, if not create them
        let user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            user = await User.create({
                firebaseUid: uid,
                email: email,
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        });
    } catch (error) {
        next(error);
    }
};
