const express = require('express');
const router = express.Router();
const assetController = require('../controllers/asset/assetController');
const { authenticateUser } = require('../middlewares/auth');
const roleCheck = require('../middlewares/role');

// Standard Access: Everyone can view details
router.get('/', assetController.getAllAssets);
router.get('/:id', assetController.getAssetById);

// Administrator Routes: Manage Assets
router.post(
    '/',
    authenticateUser,
    roleCheck('ADMINISTRATOR', 'ADMIN'),
    require('../middlewares/property/propertyMediaUpload'), // Media Upload Middleware
    assetController.createAsset
);

router.put(
    '/:id',
    authenticateUser,
    roleCheck('ADMINISTRATOR', 'ADMIN'),
    assetController.updateAsset
);

router.delete(
    '/:id',
    authenticateUser,
    roleCheck('ADMINISTRATOR', 'ADMIN'),
    assetController.deleteAsset
);

module.exports = router;