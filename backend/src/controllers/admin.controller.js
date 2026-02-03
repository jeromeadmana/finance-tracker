const { pool } = require('../config/database');

// Get all AI instructions
const getAIInstructions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ai_instructions ORDER BY priority DESC, created_at ASC`
    );

    res.json({ instructions: result.rows });
  } catch (error) {
    console.error('Get AI instructions error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch AI instructions' } });
  }
};

// Create AI instruction
const createAIInstruction = async (req, res) => {
  try {
    const { instructionType, instructionText, priority, isActive } = req.body;

    const result = await pool.query(
      `INSERT INTO ai_instructions (instruction_type, instruction_text, priority, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [instructionType, instructionText, priority || 0, isActive !== false, req.user.id]
    );

    res.status(201).json({
      message: 'AI instruction created successfully',
      instruction: result.rows[0]
    });
  } catch (error) {
    console.error('Create AI instruction error:', error);
    res.status(500).json({ error: { message: 'Failed to create AI instruction' } });
  }
};

// Update AI instruction
const updateAIInstruction = async (req, res) => {
  try {
    const { id } = req.params;
    const { instructionType, instructionText, priority, isActive } = req.body;

    const result = await pool.query(
      `UPDATE ai_instructions
       SET instruction_type = COALESCE($1, instruction_type),
           instruction_text = COALESCE($2, instruction_text),
           priority = COALESCE($3, priority),
           is_active = COALESCE($4, is_active)
       WHERE id = $5
       RETURNING *`,
      [instructionType, instructionText, priority, isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'AI instruction not found' } });
    }

    res.json({
      message: 'AI instruction updated successfully',
      instruction: result.rows[0]
    });
  } catch (error) {
    console.error('Update AI instruction error:', error);
    res.status(500).json({ error: { message: 'Failed to update AI instruction' } });
  }
};

// Delete AI instruction
const deleteAIInstruction = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM ai_instructions WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'AI instruction not found' } });
    }

    res.json({ message: 'AI instruction deleted successfully' });
  } catch (error) {
    console.error('Delete AI instruction error:', error);
    res.status(500).json({ error: { message: 'Failed to delete AI instruction' } });
  }
};

// Get all admin settings
const getAdminSettings = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM admin_settings ORDER BY setting_key'
    );

    res.json({ settings: result.rows });
  } catch (error) {
    console.error('Get admin settings error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch admin settings' } });
  }
};

// Update admin setting
const updateAdminSetting = async (req, res) => {
  try {
    const { settingKey, settingValue, description } = req.body;

    const result = await pool.query(
      `INSERT INTO admin_settings (setting_key, setting_value, description, created_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (setting_key)
       DO UPDATE SET setting_value = $2, description = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [settingKey, settingValue, description, req.user.id]
    );

    res.json({
      message: 'Admin setting updated successfully',
      setting: result.rows[0]
    });
  } catch (error) {
    console.error('Update admin setting error:', error);
    res.status(500).json({ error: { message: 'Failed to update admin setting' } });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM categories ORDER BY type, name`
    );

    res.json({ categories: result.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch categories' } });
  }
};

// Create category
const createCategory = async (req, res) => {
  try {
    const { name, type, icon, color, parentId } = req.body;

    const result = await pool.query(
      `INSERT INTO categories (name, type, icon, color, parent_id, is_system, created_by)
       VALUES ($1, $2, $3, $4, $5, false, $6)
       RETURNING *`,
      [name, type, icon, color, parentId, req.user.id]
    );

    res.status(201).json({
      message: 'Category created successfully',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: { message: 'Failed to create category' } });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, icon, color, parentId } = req.body;

    const result = await pool.query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           type = COALESCE($2, type),
           icon = COALESCE($3, icon),
           color = COALESCE($4, color),
           parent_id = COALESCE($5, parent_id)
       WHERE id = $6
       RETURNING *`,
      [name, type, icon, color, parentId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Category not found' } });
    }

    res.json({
      message: 'Category updated successfully',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: { message: 'Failed to update category' } });
  }
};

// Get category rules
const getCategoryRules = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cr.*, c.name as category_name
       FROM category_rules cr
       JOIN categories c ON cr.category_id = c.id
       ORDER BY cr.priority DESC, cr.created_at`
    );

    res.json({ rules: result.rows });
  } catch (error) {
    console.error('Get category rules error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch category rules' } });
  }
};

// Create category rule
const createCategoryRule = async (req, res) => {
  try {
    const { categoryId, pattern, ruleType, priority, isActive } = req.body;

    const result = await pool.query(
      `INSERT INTO category_rules (category_id, pattern, rule_type, priority, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [categoryId, pattern, ruleType || 'keyword', priority || 0, isActive !== false, req.user.id]
    );

    res.status(201).json({
      message: 'Category rule created successfully',
      rule: result.rows[0]
    });
  } catch (error) {
    console.error('Create category rule error:', error);
    res.status(500).json({ error: { message: 'Failed to create category rule' } });
  }
};

// Get budget templates
const getBudgetTemplates = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM budget_templates ORDER BY is_default DESC, name`
    );

    res.json({ templates: result.rows });
  } catch (error) {
    console.error('Get budget templates error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch budget templates' } });
  }
};

// Create budget template
const createBudgetTemplate = async (req, res) => {
  try {
    const { name, description, templateData, isDefault } = req.body;

    const result = await pool.query(
      `INSERT INTO budget_templates (name, description, template_data, is_default, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description, JSON.stringify(templateData), isDefault || false, req.user.id]
    );

    res.status(201).json({
      message: 'Budget template created successfully',
      template: result.rows[0]
    });
  } catch (error) {
    console.error('Create budget template error:', error);
    res.status(500).json({ error: { message: 'Failed to create budget template' } });
  }
};

// Get all AI prompts
const getAIPrompts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ai_prompts WHERE is_active = true ORDER BY category, title`
    );

    res.json({ prompts: result.rows });
  } catch (error) {
    console.error('Get AI prompts error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch AI prompts' } });
  }
};

// Create AI prompt
const createAIPrompt = async (req, res) => {
  try {
    const { title, description, promptText, category, isActive } = req.body;

    const result = await pool.query(
      `INSERT INTO ai_prompts (title, description, prompt_text, category, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description, promptText, category, isActive !== false, req.user.id]
    );

    res.status(201).json({
      message: 'AI prompt created successfully',
      prompt: result.rows[0]
    });
  } catch (error) {
    console.error('Create AI prompt error:', error);
    res.status(500).json({ error: { message: 'Failed to create AI prompt' } });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, role, is_active, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch users' } });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ error: { message: 'Invalid role' } });
    }

    const result = await pool.query(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role`,
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    res.json({
      message: 'User role updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: { message: 'Failed to update user role' } });
  }
};

module.exports = {
  getAIInstructions,
  createAIInstruction,
  updateAIInstruction,
  deleteAIInstruction,
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
};
