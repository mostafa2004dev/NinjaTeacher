-- ═══════════════════════════════════════════════════════════════════════════
-- Ninja Teacher — Complete Database Schema
-- Run this file once to set up the entire database from scratch.
-- After this, sequelize.sync({ alter: true }) handles schema evolution.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS school_jobs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE school_jobs;

-- ── Original tables (fixed to match models) ─────────────────────────────────

DROP TABLE IF EXISTS Application;
DROP TABLE IF EXISTS Post;
DROP TABLE IF EXISTS Invoices;
DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS Subscriptions;
DROP TABLE IF EXISTS SubscriptionPlans;
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS Teacher;
DROP TABLE IF EXISTS Job;
DROP TABLE IF EXISTS School;

-- Teacher (extended from original schema)
CREATE TABLE Teacher (
    Teacher_ID          INT PRIMARY KEY AUTO_INCREMENT,
    Name                VARCHAR(100) NOT NULL,
    Email               VARCHAR(100) UNIQUE NOT NULL,
    Password            VARCHAR(255) NOT NULL,
    Phone               VARCHAR(20),
    Date_of_Birth       DATE,
    Gender              VARCHAR(10),
    Qualifications      VARCHAR(200),
    Specialization      VARCHAR(100),
    Years_of_Experience INT DEFAULT 0,
    Big5_Score          DECIMAL(5,2),
    Image               VARCHAR(500),
    -- Role determines which subscription plans are available
    Role                ENUM('teacher','school') NOT NULL DEFAULT 'teacher',
    createdAt           DATETIME,
    updatedAt           DATETIME
);

-- School (original — kept for FK references)
CREATE TABLE School (
    School_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name      VARCHAR(100) NOT NULL,
    Location  VARCHAR(200),
    Type      VARCHAR(50),
    Phone     VARCHAR(20),
    Email     VARCHAR(100) UNIQUE NOT NULL
);

-- Job (original)
CREATE TABLE Job (
    Job_ID                  INT PRIMARY KEY AUTO_INCREMENT,
    Title                   VARCHAR(100) NOT NULL,
    Required_Experience     INT,
    Required_Qualification  VARCHAR(200),
    Salary_Range            VARCHAR(50)
);

-- Post (extended: added Specialization + Required_Experience for matching)
CREATE TABLE Post (
    School_ID            INT,
    Job_ID               INT,
    Title                VARCHAR(100),
    Specialization       VARCHAR(100),
    Required_Experience  INT DEFAULT 0,
    Content              TEXT,
    Description          TEXT,
    Date                 DATE,
    PRIMARY KEY (School_ID, Job_ID),
    FOREIGN KEY (School_ID) REFERENCES School(School_ID),
    FOREIGN KEY (Job_ID)    REFERENCES Job(Job_ID)
);

-- Application (extended: added Status)
CREATE TABLE Application (
    Teacher_ID  INT,
    Job_ID      INT,
    Apply_Date  DATE,
    Big5_Score  DECIMAL(5,2),
    Status      ENUM('pending','interview','accepted','rejected') DEFAULT 'pending',
    PRIMARY KEY (Teacher_ID, Job_ID),
    FOREIGN KEY (Teacher_ID) REFERENCES Teacher(Teacher_ID),
    FOREIGN KEY (Job_ID)     REFERENCES Job(Job_ID)
);

-- Notifications (auto-created by Sequelize, manual here for reference)
CREATE TABLE Notifications (
    Notification_ID INT PRIMARY KEY AUTO_INCREMENT,
    Teacher_ID      INT NOT NULL,
    Type            VARCHAR(100) NOT NULL,
    Title           VARCHAR(255) NOT NULL,
    Message         TEXT NOT NULL,
    IsRead          BOOLEAN DEFAULT FALSE,
    Related_ID      INT,
    createdAt       DATETIME,
    updatedAt       DATETIME,
    FOREIGN KEY (Teacher_ID) REFERENCES Teacher(Teacher_ID) ON DELETE CASCADE
);

-- ── Subscription & Payment tables ───────────────────────────────────────────

CREATE TABLE SubscriptionPlans (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    plan_key        VARCHAR(50) UNIQUE NOT NULL,
    name            VARCHAR(100) NOT NULL,
    target_role     ENUM('teacher','school') NOT NULL,
    price_egp       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    duration_days   INT NOT NULL DEFAULT 30,
    billing_cycle   ENUM('monthly','yearly','lifetime') DEFAULT 'monthly',
    features        JSON,
    max_applications INT DEFAULT -1,
    max_job_posts   INT DEFAULT -1,
    is_active       BOOLEAN DEFAULT TRUE,
    createdAt       DATETIME,
    updatedAt       DATETIME
);

CREATE TABLE Subscriptions (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    user_id      INT NOT NULL,
    plan_id      INT NOT NULL,
    status       ENUM('active','cancelled','expired','pending_payment') DEFAULT 'pending_payment',
    started_at   DATETIME,
    expires_at   DATETIME,
    cancelled_at DATETIME,
    price_paid   DECIMAL(10,2),
    auto_renew   BOOLEAN DEFAULT FALSE,
    notes        TEXT,
    createdAt    DATETIME,
    updatedAt    DATETIME,
    FOREIGN KEY (user_id)  REFERENCES Teacher(Teacher_ID) ON DELETE CASCADE,
    FOREIGN KEY (plan_id)  REFERENCES SubscriptionPlans(id)
);

CREATE TABLE Payments (
    id                INT PRIMARY KEY AUTO_INCREMENT,
    subscription_id   INT NOT NULL,
    user_id           INT NOT NULL,
    amount            DECIMAL(10,2) NOT NULL,
    currency          VARCHAR(10) DEFAULT 'EGP',
    provider          ENUM('instapay','vodafone_cash','orange_cash','manual','free') NOT NULL,
    status            ENUM('pending','paid','failed','expired','refunded') DEFAULT 'pending',
    transaction_ref   VARCHAR(100) UNIQUE NOT NULL,
    provider_ref      VARCHAR(200),
    provider_response JSON,
    paid_at           DATETIME,
    verified_at       DATETIME,
    verified_by       VARCHAR(100),
    expires_at        DATETIME,
    payment_proof     VARCHAR(500),
    failure_reason    VARCHAR(500),
    createdAt         DATETIME,
    updatedAt         DATETIME,
    FOREIGN KEY (subscription_id) REFERENCES Subscriptions(id),
    FOREIGN KEY (user_id)         REFERENCES Teacher(Teacher_ID) ON DELETE CASCADE
);

CREATE TABLE Invoices (
    id                    INT PRIMARY KEY AUTO_INCREMENT,
    payment_id            INT NOT NULL,
    subscription_id       INT NOT NULL,
    user_id               INT NOT NULL,
    invoice_number        VARCHAR(50) UNIQUE NOT NULL,
    amount                DECIMAL(10,2) NOT NULL,
    currency              VARCHAR(10) DEFAULT 'EGP',
    plan_name             VARCHAR(100) NOT NULL,
    billing_period_start  DATETIME,
    billing_period_end    DATETIME,
    status                ENUM('issued','void') DEFAULT 'issued',
    createdAt             DATETIME,
    updatedAt             DATETIME,
    FOREIGN KEY (payment_id)      REFERENCES Payments(id),
    FOREIGN KEY (subscription_id) REFERENCES Subscriptions(id),
    FOREIGN KEY (user_id)         REFERENCES Teacher(Teacher_ID) ON DELETE CASCADE
);

-- ── Initial plan data ────────────────────────────────────────────────────────
INSERT INTO SubscriptionPlans
  (plan_key, name, target_role, price_egp, duration_days, billing_cycle, max_applications, max_job_posts, features, is_active, createdAt, updatedAt)
VALUES
  ('teacher_free',   'Teacher Free',   'teacher', 0.00,   30, 'monthly',  5,  0, '["Up to 5 applications/month","Basic profile","Browse all jobs","Email notifications"]', 1, NOW(), NOW()),
  ('teacher_pro',    'Teacher Pro',    'teacher', 149.00, 30, 'monthly', -1,  0, '["Unlimited applications","Priority visibility","Analytics dashboard","Job match alerts","Priority support"]', 1, NOW(), NOW()),
  ('school_starter', 'School Starter', 'school',  299.00, 30, 'monthly',  0,  5, '["5 job posts/month","Basic teacher matching","View profiles","Application management"]', 1, NOW(), NOW()),
  ('school_pro',     'School Pro',     'school',  599.00, 30, 'monthly',  0, -1, '["Unlimited job posts","Advanced matching","Analytics & reports","Featured listing","API access","Priority support"]', 1, NOW(), NOW());


-- ── Admins table (مضاف جديد) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Admins (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    -- super_admin: كل الصلاحيات | moderator: يشوف ويعدل بس مش يحذف
    role        ENUM('super_admin', 'moderator') NOT NULL DEFAULT 'moderator',
    is_active   BOOLEAN DEFAULT TRUE,
    last_login  DATETIME,
    createdAt   DATETIME,
    updatedAt   DATETIME
);
