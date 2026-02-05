-- ================================
-- CPS Website Database Schema
-- Stack: MySQL + ERN + JWT
-- ================================

-- Create database
CREATE DATABASE IF NOT EXISTS cps_db;
USE cps_db;

-- Use UTF8MB4 for full Unicode support
SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ================================
-- USERS
-- ================================
CREATE TABLE users (
  id            CHAR(36) PRIMARY KEY,
  username      VARCHAR(32) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,

  display_name  VARCHAR(32),
  avatar_url    TEXT,

  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,

  is_banned     BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB;

-- ================================
-- CLICK TESTS (CPS RUNS)
-- ================================
CREATE TABLE click_tests (
  id            CHAR(36) PRIMARY KEY,
  user_id       CHAR(36) NOT NULL,

  duration_ms   INT NOT NULL,
  total_clicks  INT NOT NULL,
  cps           DECIMAL(5,2) NOT NULL,

  device_type   VARCHAR(32),
  browser       VARCHAR(64),
  user_agent    TEXT,

  started_at    DATETIME NOT NULL,
  ended_at      DATETIME NOT NULL,

  is_valid      BOOLEAN DEFAULT TRUE,

  CONSTRAINT fk_click_tests_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================================
-- FLAGGED TESTS (ANTI-CHEAT)
-- ================================
CREATE TABLE flagged_tests (
  id            CHAR(36) PRIMARY KEY,
  click_test_id CHAR(36) NOT NULL,

  reason        VARCHAR(255) NOT NULL,
  flagged_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_flagged_tests_click_test
    FOREIGN KEY (click_test_id)
    REFERENCES click_tests(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================================
-- USER STATS (CACHED PERFORMANCE)
-- ================================
CREATE TABLE user_stats (
  user_id     CHAR(36) PRIMARY KEY,

  best_cps    DECIMAL(5,2),
  avg_cps     DECIMAL(5,2),
  total_tests INT DEFAULT 0,

  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_user_stats_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================================
-- INDEXES (PERFORMANCE)
-- ================================

-- Users
CREATE INDEX idx_users_username
ON users(username);

-- Click tests
CREATE INDEX idx_click_tests_user
ON click_tests(user_id);

CREATE INDEX idx_click_tests_cps
ON click_tests(cps DESC);

CREATE INDEX idx_click_tests_valid
ON click_tests(is_valid);

CREATE INDEX idx_click_tests_duration
ON click_tests(duration_ms);

-- Flagged tests
CREATE INDEX idx_flagged_tests_click_test
ON flagged_tests(click_test_id);

-- ================================
-- END OF SCHEMA
-- ================================
