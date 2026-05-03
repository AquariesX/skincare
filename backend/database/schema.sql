-- ============================================================
-- Skinlytics Database Schema
-- Database: skincare_db  |  Engine: MySQL
-- Run: mysql -u root -p < database/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS skincare_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE skincare_db;

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(80)  UNIQUE NOT NULL,
    email        VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    is_admin     BOOLEAN DEFAULT FALSE,
    is_active    BOOLEAN DEFAULT TRUE,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Skin Analysis Records ────────────────────────────────────
CREATE TABLE IF NOT EXISTS skin_analysis (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT DEFAULT NULL,
    image_path        VARCHAR(256) NOT NULL,
    predicted_problem VARCHAR(100) NOT NULL,
    confidence_score  FLOAT        NOT NULL,
    recommendation    TEXT,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ── Skin Types ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skin_types (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- ── Ingredients ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ingredients (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    description  TEXT,
    skin_type_id INT NOT NULL,
    FOREIGN KEY (skin_type_id) REFERENCES skin_types(id) ON DELETE CASCADE
);

-- ── Products ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    category       VARCHAR(100),
    description    TEXT,
    image_filename VARCHAR(256),
    skin_type_id   INT NOT NULL,
    FOREIGN KEY (skin_type_id) REFERENCES skin_types(id) ON DELETE CASCADE
);

-- ── Quiz Questions ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_questions (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    question_text  TEXT        NOT NULL,
    option_a       VARCHAR(200) NOT NULL,
    option_b       VARCHAR(200) NOT NULL,
    option_c       VARCHAR(200) NOT NULL,
    correct_answer VARCHAR(1)  NOT NULL,
    `order`        INT         NOT NULL
);

-- ── Quiz Results ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_results (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    user_id              INT DEFAULT NULL,
    skin_type_result     VARCHAR(50) NOT NULL,
    recommendations_text TEXT,
    created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ── Blog Posts ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    title          VARCHAR(200) NOT NULL,
    content        TEXT         NOT NULL,
    featured_image VARCHAR(256),
    author_id      INT NOT NULL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
