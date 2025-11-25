-- Migration Script: Add 'email' column to 'students' and 'enquiries' tables
-- Run this script in your Supabase SQL Editor to update your existing database without losing data.

-- 1. Add email column to students table if it doesn't exist
ALTER TABLE students ADD COLUMN IF NOT EXISTS email text;

-- 2. Add email column to enquiries table if it doesn't exist
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS email text;

-- Confirmation output (optional, visible in query results)
SELECT 'Migration completed successfully' as status;
