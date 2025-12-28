const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        asset: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Asset',
            required: true,
        },
        accessRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AccessRequest',
            required: true,
        },
        source: {
            type: String,
            required: true,
            enum: ['khalti', 'esewa'],
        },
        amount: {
            type: Number,
            required: true,
            default: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
        },
        verification_data: {
            type: mongoose.Schema.Types.Mixed,
            required: false,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Payment', paymentSchema);