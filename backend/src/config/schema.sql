-- Finance Tracker Database Schema
-- Portfolio Demo Version - Simplified Authentication
-- Run this script in your shared PostgreSQL database
-- All tables use 'ft_' prefix to avoid conflicts in shared database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (ft_users)
CREATE TABLE IF NOT EXISTS ft_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('super_admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Settings table (Super Admin AI Configuration)
CREATE TABLE IF NOT EXISTS ft_admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES ft_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Instructions (Super Admin global AI configuration)
CREATE TABLE IF NOT EXISTS ft_ai_instructions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instruction_type VARCHAR(50) NOT NULL CHECK (instruction_type IN ('global', 'financial_advice', 'categorization', 'budget')),
    instruction_text TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES ft_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table (System managed)
CREATE TABLE IF NOT EXISTS ft_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    icon VARCHAR(50),
    color VARCHAR(7),
    parent_id UUID REFERENCES ft_categories(id) ON DELETE CASCADE,
    is_system BOOLEAN DEFAULT false,
    created_by UUID REFERENCES ft_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, type)
);

-- Category Rules (AI auto-categorization rules)
CREATE TABLE IF NOT EXISTS ft_category_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES ft_categories(id) ON DELETE CASCADE,
    pattern TEXT NOT NULL,
    rule_type VARCHAR(20) DEFAULT 'keyword' CHECK (rule_type IN ('keyword', 'regex', 'merchant')),
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES ft_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budget Templates (System managed)
CREATE TABLE IF NOT EXISTS ft_budget_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    template_data JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES ft_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS ft_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES ft_users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES ft_categories(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT,
    merchant VARCHAR(255),
    transaction_date DATE NOT NULL,
    payment_method VARCHAR(50),
    notes TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurring_pattern VARCHAR(50),
    tags TEXT[],
    ai_categorized BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budgets table
CREATE TABLE IF NOT EXISTS ft_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES ft_users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES ft_categories(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    period VARCHAR(20) NOT NULL CHECK (period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial Goals table
CREATE TABLE IF NOT EXISTS ft_financial_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES ft_users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(12, 2) NOT NULL,
    current_amount DECIMAL(12, 2) DEFAULT 0,
    target_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Prompts Library (System managed)
CREATE TABLE IF NOT EXISTS ft_ai_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    prompt_text TEXT NOT NULL,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES ft_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Chat History
CREATE TABLE IF NOT EXISTS ft_ai_chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES ft_users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    context JSONB,
    tokens_used INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Receipts/Documents table
CREATE TABLE IF NOT EXISTS ft_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES ft_transactions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES ft_users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    extracted_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ft_transactions_user_id ON ft_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ft_transactions_date ON ft_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_ft_transactions_category ON ft_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_ft_budgets_user_id ON ft_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_ft_budgets_category ON ft_budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_ft_ai_chat_user_id ON ft_ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ft_category_rules_category ON ft_category_rules(category_id);
CREATE INDEX IF NOT EXISTS idx_ft_financial_goals_user_id ON ft_financial_goals(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION ft_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
DROP TRIGGER IF EXISTS update_ft_users_updated_at ON ft_users;
CREATE TRIGGER update_ft_users_updated_at BEFORE UPDATE ON ft_users FOR EACH ROW EXECUTE FUNCTION ft_update_updated_at_column();

DROP TRIGGER IF EXISTS update_ft_admin_settings_updated_at ON ft_admin_settings;
CREATE TRIGGER update_ft_admin_settings_updated_at BEFORE UPDATE ON ft_admin_settings FOR EACH ROW EXECUTE FUNCTION ft_update_updated_at_column();

DROP TRIGGER IF EXISTS update_ft_ai_instructions_updated_at ON ft_ai_instructions;
CREATE TRIGGER update_ft_ai_instructions_updated_at BEFORE UPDATE ON ft_ai_instructions FOR EACH ROW EXECUTE FUNCTION ft_update_updated_at_column();

DROP TRIGGER IF EXISTS update_ft_categories_updated_at ON ft_categories;
CREATE TRIGGER update_ft_categories_updated_at BEFORE UPDATE ON ft_categories FOR EACH ROW EXECUTE FUNCTION ft_update_updated_at_column();

DROP TRIGGER IF EXISTS update_ft_transactions_updated_at ON ft_transactions;
CREATE TRIGGER update_ft_transactions_updated_at BEFORE UPDATE ON ft_transactions FOR EACH ROW EXECUTE FUNCTION ft_update_updated_at_column();

DROP TRIGGER IF EXISTS update_ft_budgets_updated_at ON ft_budgets;
CREATE TRIGGER update_ft_budgets_updated_at BEFORE UPDATE ON ft_budgets FOR EACH ROW EXECUTE FUNCTION ft_update_updated_at_column();

DROP TRIGGER IF EXISTS update_ft_financial_goals_updated_at ON ft_financial_goals;
CREATE TRIGGER update_ft_financial_goals_updated_at BEFORE UPDATE ON ft_financial_goals FOR EACH ROW EXECUTE FUNCTION ft_update_updated_at_column();

-- Insert default categories
INSERT INTO ft_categories (name, type, icon, color, is_system) VALUES
    ('Salary', 'income', 'dollar-sign', '#10b981', true),
    ('Freelance', 'income', 'briefcase', '#10b981', true),
    ('Investment', 'income', 'trending-up', '#10b981', true),
    ('Other Income', 'income', 'plus-circle', '#10b981', true),
    ('Food & Dining', 'expense', 'utensils', '#ef4444', true),
    ('Transportation', 'expense', 'car', '#f59e0b', true),
    ('Shopping', 'expense', 'shopping-bag', '#8b5cf6', true),
    ('Entertainment', 'expense', 'film', '#ec4899', true),
    ('Bills & Utilities', 'expense', 'file-text', '#3b82f6', true),
    ('Healthcare', 'expense', 'heart', '#ef4444', true),
    ('Education', 'expense', 'book', '#06b6d4', true),
    ('Housing', 'expense', 'home', '#6366f1', true),
    ('Insurance', 'expense', 'shield', '#14b8a6', true),
    ('Personal Care', 'expense', 'user', '#f97316', true),
    ('Travel', 'expense', 'plane', '#06b6d4', true),
    ('Other Expense', 'expense', 'minus-circle', '#6b7280', true)
ON CONFLICT (name, type) DO NOTHING;

-- Insert default AI instructions
INSERT INTO ft_ai_instructions (instruction_type, instruction_text, priority, is_active) VALUES
    ('global', 'You are a helpful financial assistant. Always be encouraging and supportive while providing accurate financial advice. Use clear, simple language.', 1, true),
    ('financial_advice', 'When providing financial advice, always include disclaimers that this is for informational purposes only and users should consult professional financial advisors for major decisions.', 2, true),
    ('categorization', 'When categorizing transactions, be intelligent about merchant names and descriptions. Consider context clues and common patterns.', 1, true),
    ('budget', 'When suggesting budgets, use the 50/30/20 rule as a baseline: 50% needs, 30% wants, 20% savings and debt repayment.', 1, true)
ON CONFLICT DO NOTHING;

-- Insert default admin settings
INSERT INTO ft_admin_settings (setting_key, setting_value, description) VALUES
    ('ai_features_enabled', 'true', 'Enable or disable all AI features'),
    ('auto_categorization_enabled', 'true', 'Enable automatic transaction categorization'),
    ('chatbot_enabled', 'true', 'Enable AI chatbot for financial advice'),
    ('max_tokens_per_request', '1000', 'Maximum tokens for AI requests'),
    ('emergency_fund_months', '6', 'Recommended months of expenses for emergency fund'),
    ('demo_user_transaction_limit', '50', 'Maximum transactions for demo user')
ON CONFLICT (setting_key) DO NOTHING;
