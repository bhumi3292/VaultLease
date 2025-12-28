const AccessRequest = require('../models/AccessRequest');
const Asset = require('../models/Asset');
const ApiResponse = require('../utils/api_response');

// 1. Create a Request (Requester)
const createRequest = async (req, res) => {
    try {
        const { assetId, startDate, expectedReturnDate, notes } = req.body;

        const asset = await Asset.findById(assetId);
        if (!asset) return res.status(404).json(new ApiResponse(404, null, "Asset not found"));

        if (asset.status !== 'Available') {
            return res.status(400).json(new ApiResponse(400, null, "Asset is not currently available"));
        }

        const newRequest = new AccessRequest({
            asset: assetId,
            requester: req.user._id,
            startDate,
            expectedReturnDate,
            requestNotes: notes,
            status: 'Pending',
            accessFee: asset.accessFee // Copy current fee at time of request
        });

        await newRequest.save();
        return res.status(201).json(new ApiResponse(201, newRequest, "Access request submitted"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, error.message));
    }
};

// 2. Get My Requests (Requester)
const getMyRequests = async (req, res) => {
    try {
        const requests = await AccessRequest.find({ requester: req.user._id })
            .populate('asset')
            .sort({ createdAt: -1 });
        return res.status(200).json(new ApiResponse(200, requests, "Your requests"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, error.message));
    }
};

// 3. Get Incoming Requests (Administrator)
const getDepartmentRequests = async (req, res) => {
    try {
        // Step 1: Find all assets owned by this admin
        const assets = await Asset.find({ administrator: req.user._id }).select('_id');
        const assetIds = assets.map(a => a._id);

        // Step 2: Find requests for these assets
        const requests = await AccessRequest.find({ asset: { $in: assetIds } })
            .populate('asset')
            .populate('requester', 'fullName email universityId')
            .sort({ createdAt: -1 });

        return res.status(200).json(new ApiResponse(200, requests, "Department requests"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, error.message));
    }
};

// 4. Update Status (Administrator: Approve, Reject, Issue, Return)
// This is the core workflow engine.
const updateRequestStatus = async (req, res) => {
    try {
        const { status, adminNotes } = req.body; // e.g., 'Approved', 'Rejected', 'Active', 'Returned'
        const requestId = req.params.id;

        const request = await AccessRequest.findById(requestId).populate('asset');
        if (!request) return res.status(404).json(new ApiResponse(404, null, "Request not found"));

        // Verify ownership (security check)
        if (req.user.role !== 'ADMIN' && request.asset.administrator.toString() !== req.user._id.toString()) {
            return res.status(403).json(new ApiResponse(403, null, "Not authorized to manage this request"));
        }

        // Logic for specific transitions
        if (status === 'Active') {
            // "Checkout" - Asset becomes In Use
            await Asset.findByIdAndUpdate(request.asset._id, { status: 'In Use' });
        } else if (status === 'Returned') {
            // "Return" - Asset becomes Available
            const now = new Date();
            request.actualReturnDate = now;
            await Asset.findByIdAndUpdate(request.asset._id, { status: 'Available' });
        }

        request.status = status;
        if (adminNotes) request.adminNotes = adminNotes;
        if (req.body.approver) request.approver = req.user._id;

        await request.save();

        // Audit Log
        const logAction = require('../utils/auditLogger');
        await logAction({
            userId: req.user._id,
            action: 'UPDATE', // Could be dynamic based on status (APPROVE/REJECT)
            entity: 'AccessRequest',
            entityId: request._id,
            details: {
                status: status,
                asset: request.asset.name,
                requester: request.requester
            }
        }, req);

        return res.status(200).json(new ApiResponse(200, request, `Request status updated to ${status}`));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, error.message));
    }
};

module.exports = {
    createRequest,
    getMyRequests,
    getDepartmentRequests,
    updateRequestStatus
};