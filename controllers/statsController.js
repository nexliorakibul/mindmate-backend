import Journal from '../models/Journal.js';
import Mood from '../models/Mood.js';
import AppError from '../utils/AppError.js';

// @desc    Get user stats including streak
// @route   GET /api/stats
// @access  Private
export const getStats = async (req, res, next) => {
    try {
        const userId = req.user.uid;

        // Fetch dates from both collections
        const journalDates = await Journal.find({ userId }, 'date').lean();
        const moodDates = await Mood.find({ userId }, 'date').lean();

        // Combine and normalize dates (YYYY-MM-DD string format to handle uniqueness)
        const allDates = [
            ...journalDates.map(entry => entry.date),
            ...moodDates.map(entry => entry.date)
        ];

        // Create a Set of unique date strings (YYYY-MM-DD)
        const uniqueDaysSet = new Set(
            allDates.map(date => {
                // Ensure date object
                const d = new Date(date);
                return d.toISOString().split('T')[0];
            })
        );

        // Convert back to sorted array of timestamps
        const sortedUniqueDays = Array.from(uniqueDaysSet).sort().reverse(); // Descending order (recent first)

        // Calculate Streak
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        
        // Helper to check if a date string is "yesterday" relative to "current"
        const isYesterday = (currentStr, prevStr) => {
            const current = new Date(currentStr);
            const prev = new Date(prevStr);
            const diffTime = current - prev;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return Math.round(diffDays) === 1;
        };

        if (sortedUniqueDays.length > 0) {
            // Check if user has an entry for today
            let hasEntryToday = sortedUniqueDays[0] === today;
            let currentIndex = 0;

            // If user has an entry today, streak starts at 1
            // If user has no entry today but has one yesterday, streak is maintained but doesn't include today yet
            // Wait, streak standard definition usually implies "current active streak". 
            // If I did it yesterday, I have a 1 day streak (carried over). If I do it today, becomes 2.
            
            // Algorithm: 
            // 1. Check if latest entry is Today or Yesterday. If neither, streak is 0.
            const latest = sortedUniqueDays[0];
            if (latest === today) {
                streak = 1;
                currentIndex = 1;
            } else if (isYesterday(today, latest)) {
                // Streak is valid from yesterday, but "today" is not added yet.
                // Depending on UI preference. Usually "Current Streak" implies unbroken chain ending now.
                // Often apps show the streak count including yesterday if today isn't over.
                streak = 0; // Or keep counting past consecutives?
                // Let's count consecutive days going back from the latest valid entry
                streak = 1;
                currentIndex = 1;
            } else {
                 streak = 0;
            }

            // Count backwards
            if (streak > 0) {
                for (let i = currentIndex; i < sortedUniqueDays.length; i++) {
                    const prevDate = sortedUniqueDays[i];
                    const currentDate = sortedUniqueDays[i - 1]; // Compare with the one before in the loop (which is actually 'later' in time)
                    
                    if (isYesterday(currentDate, prevDate)) {
                        streak++;
                    } else {
                        break;
                    }
                }
            }
        }

        res.status(200).json({
            status: 'success',
            data: {
                streak,
                totalEntries: sortedUniqueDays.length
            }
        });

    } catch (error) {
        next(error);
    }
};
