const mongoose = require('mongoose');

const AccessRequestSchema = new mongoose.Schema({
    asset: {
        type: mongoose.Schema.ObjectId,
        ref: 'Asset',
        required: true
    },
    requester: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    approver: {
        type: mongoose.Schema.ObjectId,
        ref: 'User' // The Administrator who approves/rejects
    },

    // Access Duration
    startDate: {
        type: Date,
        required: true
    },
    expectedReturnDate: {
        type: Date,
        required: true
    },
    actualReturnDate: {
        type: Date
    },

    // Request Lifecycle
    status: {
        type: String,
        enum: [
            'Pending',    // Submitted by Requester
            'Approved',   // Approved by Admin, awaiting pickup
            'Rejected',   // Denied by Admin
            'Active',     // Picked up / Checked out
            'Returned',   // Returned to Admin
            'Overdue',    // Not returned by expected date
            'Cancelled'   // Cancelled by Requester
        ],
        default: 'Pending'
    },

    // Financials
    accessFee: {
        type: Number,
        default: 0
    },
    lateFee: {
        type: Number,
        default: 0
    },
    totalAmountPaid: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Paid', 'Partial', 'Waived'],
        default: 'Unpaid'
    },

    // Audit
    requestNotes: String, // From requester (e.g. "Need for Physics final")
    adminNotes: String,   // From admin (e.g. "Returned with missing cable")

}, { timestamps: true });

// Indexes for quick filtering
AccessRequestSchema.index({ requester: 1, status: 1 });
AccessRequestSchema.index({ asset: 1, status: 1 });
AccessRequestSchema.index({ department: 1 }); // If we add department denormalization later

module.exports = mongoose.model('AccessRequest', AccessRequestSchema);