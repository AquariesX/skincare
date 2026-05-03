-- =============================================================================
-- FYP Skin Care — Database Schema Fix Script
-- Run this in phpMyAdmin or MySQL CLI: mysql -u root skincare_db < fix_database.sql
-- =============================================================================

USE skincare_db;

-- =============================================================================
-- 1. FIX products TABLE
--    Current DB:  id, name, category, description, image_filename, skin_type_id
--    Model needs: id, skin_type_id, name, category, product_type, description,
--                 usage_instruction, ingredients, image_path, created_at, updated_at
-- =============================================================================

-- Rename image_filename → image_path
ALTER TABLE products
    CHANGE COLUMN image_filename image_path VARCHAR(256) DEFAULT NULL;

-- Add missing columns (safe to run even if some already exist — use IF NOT EXISTS via separate checks)
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS product_type    VARCHAR(80)  DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS usage_instruction TEXT        DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS ingredients     TEXT         DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- =============================================================================
-- 2. FIX skin_analysis TABLE
--    Current DB:  id, user_id, image_path, predicted_problem, confidence_score,
--                 recommendation (text), created_at
--    Model needs: id, user_id, image_path, predicted_condition, confidence_score,
--                 skin_type_id, recommendation_id, created_at
-- =============================================================================

-- Rename predicted_problem → predicted_condition
ALTER TABLE skin_analysis
    CHANGE COLUMN predicted_problem predicted_condition VARCHAR(100) NOT NULL;

-- Remove the old free-text recommendation column
ALTER TABLE skin_analysis
    DROP COLUMN IF EXISTS `recommendation`;

-- Add the FK columns the model expects
ALTER TABLE skin_analysis
    ADD COLUMN IF NOT EXISTS skin_type_id      INT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS recommendation_id INT DEFAULT NULL;

-- =============================================================================
-- 3. FIX skin_types DUPLICATE ENTRIES
--    IDs 1-5 are lowercase+underscore (match AI model output) — KEEP THESE
--    IDs 6-8 are title-case duplicates created by old seed script — DELETE THEM
--    First re-point recommendations that reference 6,7,8 to the correct IDs 2,3,4
-- =============================================================================

-- Fix recommendation FKs before deleting the orphaned skin types
UPDATE recommendations SET skin_type_id = 2 WHERE skin_type_id = 6;  -- Dark Spots → dark_spots
UPDATE recommendations SET skin_type_id = 3 WHERE skin_type_id = 7;  -- Normal Skin → normal_skin
UPDATE recommendations SET skin_type_id = 4 WHERE skin_type_id = 8;  -- Puffy Eyes  → puffy_eyes

-- Now safe to delete the duplicate title-case skin types
DELETE FROM skin_types WHERE id IN (6, 7, 8);

-- =============================================================================
-- 4. VERIFY results
-- =============================================================================
SELECT 'skin_types' AS tbl, id, name FROM skin_types ORDER BY id;
SELECT 'recommendations' AS tbl, id, skin_type_id FROM recommendations ORDER BY id;
SELECT 'users columns' AS info, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'skincare_db' AND TABLE_NAME = 'users';
SELECT 'products columns' AS info, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'skincare_db' AND TABLE_NAME = 'products';
SELECT 'skin_analysis columns' AS info, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'skincare_db' AND TABLE_NAME = 'skin_analysis';
