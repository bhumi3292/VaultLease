const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'PROMOTE_USER', 'OTHER']
    },
    entity: {
        type: String,
        required: true, // e.g., 'Asset', 'AccessRequest', 'User'
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    details: {
        type: Object, // Flexible field for changed values, snapshots, etc.
        default: {}
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
