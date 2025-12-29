const cron = require('node-cron');
const AccessRequest = require('../models/AccessRequest');
const User = require('../models/User');
const { notify } = require('../utils/notifier');
const logAction = require('../utils/auditLogger');

// Run every hour to check for overdue items
const initCronJobs = () => {
    console.log('Initializing scheduled property check jobs...');

    // Job 1: Check for Overdue items (Once every hour: '0 * * * *')
    cron.schedule('0 * * * *', async () => {
        console.log('Running Overdue Asset Check...');
        const now = new Date();

        try {
            const overdueRequests = await AccessRequest.find({
                status: 'Active',
                expectedReturnDate: { $lt: now }
            }).populate('requester').populate('asset');

            for (const req of overdueRequests) {
                req.status = 'Overdue';
                req.lateFee = (req.lateFee || 0) + 10;
                await req.save();

                await notify({
                    userId: req.requester._id,
                    email: req.requester.email,
                    subject: `OVERDUE NOTICE: ${req.asset.name}`,
                    text: `You are late returning ${req.asset.name}. A late fee has been applied. Please return immediately.`,
                    html: `<p style="color:red; font-weight:bold;">You are late returning ${req.asset.name}. A late fee has been applied. Please return immediately.</p>`,
                    type: 'URGENT'
                });

                await logAction({
                    userId: req.requester._id,
                    action: 'SYSTEM_OVERDUE_FLAG',
                    entity: 'AccessRequest',
                    entityId: req._id,
                    details: { message: 'Asset marked overdue automatically', feeApplied: 10 }
                }, { user: { _id: null, role: 'SYSTEM' } });
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
                await notify({
                    userId: req.requester._id,
                    email: req.requester.email,
                    subject: `Reminder: Return ${req.asset.name} Tomorrow`,
                    text: `This is a reminder to return ${req.asset.name} by ${new Date(req.expectedReturnDate).toDateString()} to avoid late fees.`,
                    html: `<p>This is a reminder to return ${req.asset.name} by ${new Date(req.expectedReturnDate).toDateString()} to avoid late fees.</p>`,
                    type: 'WARNING'
                });
            }
        } catch (err) {
            console.error("Error in Due Soon Cron Job:", err);
        }
    });
};

module.exports = initCronJobs;
