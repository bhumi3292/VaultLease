const cron = require('node-cron');
const AccessRequest = require('../models/AccessRequest');
const User = require('../models/User');
const { sendEmail } = require('../utils/sendEmail');
const logAction = require('../utils/auditLogger');

// Run every hour to check for overdue items
const initCronJobs = () => {
    console.log('Initializing scheduled property check jobs...');

    // Job 1: Check for Overdue items (Once every hour: '0 * * * *')
    // For Demo: Run every minute '* * * * *' to show effect quickly? 
    // Let's stick to hourly for correctness, or let's do every 30 mins '*/30 * * * *'
    cron.schedule('0 * * * *', async () => {
        console.log('Running Overdue Asset Check...');
        const now = new Date();

        try {
            // Find Active requests where return date has passed
            const overdueRequests = await AccessRequest.find({
                status: 'Active',
                expectedReturnDate: { $lt: now }
            }).populate('requester').populate('asset');

            for (const req of overdueRequests) {
                // Update Status
                req.status = 'Overdue';
                req.lateFee = (req.lateFee || 0) + 10; // Simple $10 penalty initial
                await req.save();

                // Notify User
                const subject = `OVERDUE NOTICE: ${req.asset.name}`;
                const text = `You are late returning ${req.asset.name}. A late fee has been applied. Please return immediately.`;
                await sendEmail(req.requester.email, subject, text, `<p style="color:red; font-weight:bold;">${text}</p>`);

                // Log
                await logAction({
                    userId: req.requester._id, // Blame the requester? Or System?
                    action: 'SYSTEM_OVERDUE_FLAG',
                    entity: 'AccessRequest',
                    entityId: req._id,
                    details: { message: 'Asset marked overdue automatically', feeApplied: 10 }
                }, { user: { _id: null, role: 'SYSTEM' } }); // Mock req object
            }

            if (overdueRequests.length > 0) {
                console.log(`Processed ${overdueRequests.length} overdue requests.`);
            }

        } catch (err) {
            console.error("Error in Overdue Cron Job:", err);
        }
    });

    // Job 2: Warning for items due soon (e.g., in 24 hours) - Run daily at 8 AM '0 8 * * *'
    cron.schedule('0 8 * * *', async () => {
        console.log('Running Due Soon Check...');
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        try {
            const dueSoon = await AccessRequest.find({
                status: 'Active',
                expectedReturnDate: { $gt: now, $lt: tomorrow }
            }).populate('requester').populate('asset');

            for (const req of dueSoon) {
                const subject = `Reminder: Return ${req.asset.name} Tomorrow`;
                const text = `This is a reminder to return ${req.asset.name} by ${new Date(req.expectedReturnDate).toDateString()} to avoid late fees.`;
                await sendEmail(req.requester.email, subject, text, `<p>${text}</p>`);
            }
        } catch (err) {
            console.error("Error in Due Soon Cron Job:", err);
        }
    });
};

module.exports = initCronJobs;
