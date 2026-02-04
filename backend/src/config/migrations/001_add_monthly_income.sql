-- Migration: Add monthly_income column to ft_users table
-- Date: 2026-02-04
-- Description: Add optional monthly income field for budget recommendations

ALTER TABLE ft_users
ADD COLUMN IF NOT EXISTS monthly_income DECIMAL(12,2) DEFAULT NULL;

COMMENT ON COLUMN ft_users.monthly_income IS 'Optional monthly income for budget recommendations. NULL indicates variable income.';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ft_users' AND column_name = 'monthly_income';
