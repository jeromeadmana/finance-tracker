const express = require('express');
const router = express.Router();
const { authenticateToken, requireSuperAdmin, requireAdmin } = require('../middleware/auth.middleware');
const {
  getAIInstructions,
  createAIInstruction,
  updateAIInstruction,
  deleteAIInstruction,
  resetAIInstructions,
  getAdminSettings,
  updateAdminSetting,
  getCategories,
  createCategory,
  updateCategory,
  getCategoryRules,
  createCategoryRule,
  getBudgetTemplates,
  createBudgetTemplate,
  getAIPrompts,
  createAIPrompt,
  getAllUsers,
  updateUserRole
} = require('../controllers/admin.controller');

// All admin routes require authentication
router.use(authenticateToken);

// AI Instructions (Super Admin only)
router.get('/ai-instructions', requireSuperAdmin, getAIInstructions);
router.post('/ai-instructions', requireSuperAdmin, createAIInstruction);
router.put('/ai-instructions/:id', requireSuperAdmin, updateAIInstruction);
router.delete('/ai-instructions/:id', requireSuperAdmin, deleteAIInstruction);
router.post('/ai-instructions/reset', requireSuperAdmin, resetAIInstructions);

// Admin Settings (Super Admin only)
router.get('/settings', requireSuperAdmin, getAdminSettings);
router.put('/settings', requireSuperAdmin, updateAdminSetting);

// Categories (Admin and Super Admin)
router.get('/categories', requireAdmin, getCategories);
router.post('/categories', requireAdmin, createCategory);
router.put('/categories/:id', requireAdmin, updateCategory);

// Category Rules (Admin and Super Admin)
router.get('/category-rules', requireAdmin, getCategoryRules);
router.post('/category-rules', requireAdmin, createCategoryRule);

// Budget Templates (Admin and Super Admin)
router.get('/budget-templates', requireAdmin, getBudgetTemplates);
router.post('/budget-templates', requireAdmin, createBudgetTemplate);

// AI Prompts (Admin and Super Admin)
router.get('/ai-prompts', requireAdmin, getAIPrompts);
router.post('/ai-prompts', requireAdmin, createAIPrompt);

// User Management (Super Admin only)
router.get('/users', requireSuperAdmin, getAllUsers);
router.put('/users/:userId/role', requireSuperAdmin, updateUserRole);

module.exports = router;
