const AuditLog = require('../models/AuditLog');

/**
 * Log a system action to the database.
 * @param {Object} params - The log parameters.
 * @param {string} params.userId - The ID of the user performing the action.
 * @param {string} params.action - The action type (e.g., 'CREATE', 'UPDATE').
 * @param {string} params.entity - The entity being affected (e.g., 'Asset').
 * @param {string} params.entityId - The ID of the entity (optional).
 * @param {Object} params.details - Additional details about the action (optional).
 * @param {Object} req - The Express request object (optional, for IP/UserAgent).
 */
const logAction = async ({ userId, action, entity, entityId, details }, req = null) => {
    try {
        const logEntry = new AuditLog({
            user: userId,
            action,
            entity,
            entityId,
            details,
            ipAddress: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : undefined,
            userAgent: req ? req.headers['user-agent'] : undefined
        });

        await logEntry.save();
        console.log(`[AUDIT] ${action} on ${entity} by ${userId}`);
    } catch (error) {
        console.error('[AUDIT LOG ERROR]', error);
        // We don't want to crash the request if logging fails, so we just log the error.
    }
};

module.exports = logAction;
