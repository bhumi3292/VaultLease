// dreamdwell_backend/middlewares/resourceAuthMiddleware.js

// --- CORRECTED IMPORT PATH FOR AVAILABILITY ---
const Availability = require('../models/calendar'); // Corrected from '../models/calendar'
const Booking = require('../models/Booking');
const Property = require('../models/Property');

const isOwnerOrRelatedResource = (Model, resourceIdParam) => async (req, res, next) => {
    try {
        const resourceId = req.params[resourceIdParam];
        const userId = req.user._id;

        const resource = await Model.findById(resourceId);

        if (!resource) {
            return res.status(404).json({ success: false, message: `${Model.modelName} not found.` });
        }

        // --- Authorization Logic ---

        if (resource.landlord && resource.landlord.toString() === userId.toString()) {
            return next();
        }
        if (resource.tenant && resource.tenant.toString() === userId.toString()) {
            return next();
        }

        if (resource.property) {
            const property = await Property.findById(resource.property);
            if (property && property.landlord.toString() === userId.toString()) {
                return next();
            }
        }

        res.status(403).json({ success: false, message: 'Access denied: You are not authorized to perform this action on this resource.' });

    } catch (error) {
        console.error('Resource Authorization middleware error:', error);
        res.status(500).json({ success: false, message: 'Server error during authorization.' });
    }
};

module.exports = {
    isOwnerOrRelatedResource
};