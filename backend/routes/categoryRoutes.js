const express = require('express');
const router = express.Router();
const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require('../controllers/category/categoryController');
const { authenticateUser } = require('../middlewares/authorizedUser');

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', authenticateUser, createCategory);
router.put('/:id', authenticateUser, updateCategory);
router.delete('/:id', authenticateUser, deleteCategory);

module.exports = router;
