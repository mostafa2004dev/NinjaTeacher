-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: school_jobs
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `school_jobs`
--

/*!40000 DROP DATABASE IF EXISTS `school_jobs`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `school_jobs` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `school_jobs`;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','moderator') NOT NULL DEFAULT 'moderator',
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'Super Admin','admin@ninjateacher.com','$2a$10$Qa8j6HV6Kyg0MhWs.tmulecy.Y04xYMH8DgdBmhg9csmMNgOFOh2y','super_admin',1,'2026-06-24 22:58:00','2026-06-22 00:10:42','2026-06-24 22:58:00'),(2,'Omar Moderator','omar@admin.com','$2a$10$gk30iG1.EcWUX9qZoKbli.8WzikuaOhp4c4xIWjiiiRkidtN5EIGm','moderator',1,NULL,'2026-05-24 18:42:36','2026-05-24 18:42:36'),(3,'Omar fgModerator','omarf@admin.com','$2a$10$b9wBlsnGfWy5zfggvj9eIeY7.rGW3yFkm1SIJu4UE/wJgXpqyh9i2','moderator',1,NULL,'2026-05-24 18:43:11','2026-05-24 18:43:11');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application`
--

DROP TABLE IF EXISTS `application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `application` (
  `Teacher_ID` int(11) NOT NULL COMMENT 'Applicant (teacher account)',
  `School_ID` int(11) NOT NULL COMMENT 'Part of the composite PK with Teacher_ID + Job_ID. FK to Post.School_ID.',
  `Job_ID` int(11) NOT NULL COMMENT 'FK to Post.Job_ID (per-school sequence)',
  `Apply_Date` date DEFAULT NULL,
  `Big5_Score` decimal(5,2) DEFAULT NULL,
  `Status` enum('pending','shortlisted','interview','accepted','rejected') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`Teacher_ID`,`School_ID`,`Job_ID`),
  KEY `application__school__i_d__job__i_d` (`School_ID`,`Job_ID`),
  KEY `application__teacher__i_d` (`Teacher_ID`),
  KEY `application__status` (`Status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application`
--

LOCK TABLES `application` WRITE;
/*!40000 ALTER TABLE `application` DISABLE KEYS */;
INSERT INTO `application` VALUES (2,1,1,'2026-06-22',NULL,'interview'),(8,3,3,'2026-06-23',NULL,'accepted'),(10,3,3,'2026-06-23',NULL,'accepted'),(14,13,3,'2026-06-23',NULL,'accepted'),(17,16,1,'2026-06-24',NULL,'interview'),(23,1,1,'2026-06-24',49.00,'pending');
/*!40000 ALTER TABLE `application` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assessments`
--

DROP TABLE IF EXISTS `assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assessments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`answers`)),
  `decision` enum('ACCEPTED','REJECTED') DEFAULT NULL,
  `confidence` decimal(5,1) DEFAULT NULL,
  `raw_score` decimal(5,1) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `positive_factors` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`positive_factors`)),
  `negative_factors` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`negative_factors`)),
  `suggestions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`suggestions`)),
  `status` enum('pending','completed','failed') DEFAULT 'pending',
  `error_message` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessments`
--

LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
INSERT INTO `assessments` VALUES (1,14,'{\"Tech use\":\"Always\",\"Integrate AI\":\"Often\",\"Disruptive\":\"Rarely\",\"slow learners\":\"Give individual attention\",\"Disinterested\":\"Try to engage them\",\"Parent objections\":\"Schedule a meeting\",\"High performers\":\"Provide extra challenges\",\"AI homework\":\"Allow with citations\",\"AI app concerns\":\"Discuss responsibly\",\"I disagreed with a fellow teacher or administrator (regarding teaching methods).\":\"Discussed respectfully\",\"Age\":\"28\",\"Experience\":\"3\",\"Gender\":\"Male\",\"Teacher for the stage\":\"Primary\",\"Languages\":\"Arabic, English\",\"Compensation\":\"Acceptable\",\"chronic disease\":\"None\",\"I noticed that one of the students\' performance levels started to decline and he became withdrawn.\":\"Contacted parents\",\"Engagement\":\"Daily activities\",\"New skill\":\"Attended workshop\"}',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'failed','AI service unreachable at http://localhost:8000. Input X contains NaN.\nGradientBoostingClassifier does not accept missing values encoded as NaN natively. For supervised learning, you might want to consider sklearn.ensemble.HistGradientBoostingClassifier and Regressor which accept missing values encoded as NaNs natively. Alternatively, it is possible to preprocess the data, for instance by using an imputer transformer in a pipeline or drop samples with missing values. See https://scikit-learn.org/stable/modules/impute.html You can find a list of all estimators that handle NaN values at the following page: https://scikit-learn.org/stable/modules/impute.html#estimators-that-handle-nan-values','2026-06-23 19:51:59','2026-06-23 19:52:00'),(2,2,'{\"Disruptive\":\"Talk individually\",\"slow learners\":\"Adjust by level\",\"Disinterested\":\"Engaging activities\",\"Parent objections\":\"Explain calmly\",\"I noticed that one of the students\' performance levels started to decline and he became withdrawn.\":\"Talk support\",\"I disagreed with a fellow teacher or administrator (regarding teaching methods).\":\"Present calmly\",\"Engagement\":\"Excellent interaction, no effect on quality\",\"New skill\":\"Applying consistently in class every day\",\"High performers\":\"Challenges\",\"Compensation\":\"Agree\",\"Tech use\":\"Effectively\",\"AI homework\":\"Discuss content\",\"Integrate AI\":\"I use it in the classroom to create interactive activities with the students.\",\"AI app concerns\":\"How secure and private is Noob\'s data on this application?\",\"Age\":\"18-25\",\"Experience\":\"2yrs\",\"Gender\":\"Male\",\"Teacher for the stage\":\"Primary\",\"Languages\":\"Arabic;English\",\"chronic disease\":\"No\"}','ACCEPTED',59.2,94.0,'هذا المعلم يستوفي معايير القبول.','[{\"feature\":\"Handling disruptive students\",\"key\":\"Disruptive\",\"value\":0.1029},{\"feature\":\"AI tool integration\",\"key\":\"Integrate AI\",\"value\":0.0626},{\"feature\":\"New skill learned\",\"key\":\"New skill\",\"value\":0.047},{\"feature\":\"Handling conflict with colleagues\",\"key\":\"I disagreed with a fellow teacher or administrator (regarding teaching methods).\",\"value\":0.0268}]','[{\"feature\":\"Technology usage\",\"key\":\"Tech use\",\"value\":-0.0561},{\"feature\":\"Teaching weaker students\",\"key\":\"slow learners\",\"value\":-0.0068},{\"feature\":\"Age\",\"key\":\"Age\",\"value\":-0.0038}]','[\"حسّن استخدام التكنولوجيا الفعّال داخل الفصل.\",\"كيّف أسلوب الشرح حسب مستوى كل طالب.\",\"تعامل مع الطلاب كثيري الحركة بشكل فردي، مش أمام الفصل.\"]','completed',NULL,'2026-06-23 20:24:38','2026-06-23 20:24:39'),(3,17,'{\"Disruptive\":\"Talk individually\",\"slow learners\":\"Adjust by level\",\"Disinterested\":\"Engaging activities\",\"Parent objections\":\"Explain calmly\",\"I noticed that one of the students\' performance levels started to decline and he became withdrawn.\":\"Talk support\",\"I disagreed with a fellow teacher or administrator (regarding teaching methods).\":\"Present calmly\",\"Engagement\":\"Excellent interaction, no effect on quality\",\"New skill\":\"Applying consistently in class every day\",\"High performers\":\"Challenges\",\"Compensation\":\"Agree\",\"Tech use\":\"Effectively\",\"AI homework\":\"Discuss content\",\"Integrate AI\":\"I use it in the classroom to create interactive activities with the students.\",\"AI app concerns\":\"How secure and private is Noob\'s data on this application?\",\"Age\":\"26-30\",\"Experience\":\"5-10 years\",\"Gender\":\"Male\",\"Teacher for the stage\":\"Primary\",\"Languages\":\"Arabic;English\",\"chronic disease\":\"No\"}','ACCEPTED',59.2,94.0,'هذا المعلم يستوفي معايير القبول.','[{\"feature\":\"Handling disruptive students\",\"key\":\"Disruptive\",\"value\":0.1029},{\"feature\":\"AI tool integration\",\"key\":\"Integrate AI\",\"value\":0.0626},{\"feature\":\"New skill learned\",\"key\":\"New skill\",\"value\":0.047},{\"feature\":\"Handling conflict with colleagues\",\"key\":\"I disagreed with a fellow teacher or administrator (regarding teaching methods).\",\"value\":0.0268}]','[{\"feature\":\"Technology usage\",\"key\":\"Tech use\",\"value\":-0.0561},{\"feature\":\"Teaching weaker students\",\"key\":\"slow learners\",\"value\":-0.0068},{\"feature\":\"Age\",\"key\":\"Age\",\"value\":-0.0038}]','[\"حسّن استخدام التكنولوجيا الفعّال داخل الفصل.\",\"كيّف أسلوب الشرح حسب مستوى كل طالب.\",\"تعامل مع الطلاب كثيري الحركة بشكل فردي، مش أمام الفصل.\"]','completed',NULL,'2026-06-23 21:38:48','2026-06-23 21:38:49'),(4,16,'{\"Disruptive\":\"A\",\"slow learners\":\"B\",\"Disinterested\":\"C\",\"Parent objections\":\"D\",\"I noticed that one of the students\' performance levels started to decline and he became withdrawn.\":\"E\",\"I disagreed with a fellow teacher or administrator (regarding teaching methods).\":\"F\",\"Engagement\":\"G\",\"New skill\":\"H\",\"High performers\":\"I\",\"Compensation\":\"J\",\"Tech use\":\"K\",\"AI homework\":\"L\",\"Integrate AI\":\"M\",\"AI app concerns\":\"N\",\"Age\":\"26-30\",\"Experience\":\"1yr\",\"Gender\":\"Female\",\"Teacher for the stage\":\"Primary\",\"Languages\":\"Arabic;English\",\"chronic disease\":\"No\"}',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'failed','AI service unreachable at http://localhost:8000. Input X contains NaN.\nGradientBoostingClassifier does not accept missing values encoded as NaN natively. For supervised learning, you might want to consider sklearn.ensemble.HistGradientBoostingClassifier and Regressor which accept missing values encoded as NaNs natively. Alternatively, it is possible to preprocess the data, for instance by using an imputer transformer in a pipeline or drop samples with missing values. See https://scikit-learn.org/stable/modules/impute.html You can find a list of all estimators that handle NaN values at the following page: https://scikit-learn.org/stable/modules/impute.html#estimators-that-handle-nan-values','2026-06-23 21:47:26','2026-06-23 21:47:26'),(5,23,'{\"Disruptive\":\"Calm then explain\",\"slow learners\":\"Adjust by level\",\"Disinterested\":\"Encouragement\",\"Parent objections\":\"Explain calmly\",\"I noticed that one of the students\' performance levels started to decline and he became withdrawn.\":\"Talk support\",\"I disagreed with a fellow teacher or administrator (regarding teaching methods).\":\"Present calmly\",\"Engagement\":\"Weak interaction, strong effect\",\"New skill\":\"None\",\"High performers\":\"I asked him to be quiet until his colleague finished.\",\"Compensation\":\"I strongly agree\",\"Tech use\":\"No, use it\",\"AI homework\":\"Reject homework\",\"Integrate AI\":\"No, I don\'t use it and I prefer the traditional methods completely.\",\"AI app concerns\":\"The ease of use and design of the application.\",\"Age\":\"26-30\",\"Experience\":\"1yr\",\"Gender\":\"Male\",\"Teacher for the stage\":\"Primary\",\"Languages\":\"Arabic;English\",\"chronic disease\":\"No\"}','REJECTED',99.5,49.0,'هذا المعلم يستوفي معايير القبول.','[{\"feature\":\"Technology usage\",\"key\":\"Tech use\",\"value\":0.1464},{\"feature\":\"Handling disruptive students\",\"key\":\"Disruptive\",\"value\":0.0729},{\"feature\":\"New skill learned\",\"key\":\"New skill\",\"value\":0.0454},{\"feature\":\"Handling parent objections\",\"key\":\"Parent objections\",\"value\":0.0289}]','[{\"feature\":\"AI tool integration\",\"key\":\"Integrate AI\",\"value\":-0.0158},{\"feature\":\"Gender\",\"key\":\"Gender\",\"value\":-0.0065},{\"feature\":\"Teaching weaker students\",\"key\":\"slow learners\",\"value\":-0.0048}]','[\"ادمج أدوات الـ AI في التدريس نفسه، مش بس في التحضير.\",\"كيّف أسلوب الشرح حسب مستوى كل طالب.\",\"حسّن استخدام التكنولوجيا الفعّال داخل الفصل.\"]','completed',NULL,'2026-06-23 23:53:37','2026-06-23 23:53:39'),(6,23,'{\"Disruptive\":\"Calm then explain\",\"slow learners\":\"Adjust by level\",\"Disinterested\":\"Encouragement\",\"Parent objections\":\"Explain calmly\",\"I noticed that one of the students\' performance levels started to decline and he became withdrawn.\":\"Talk support\",\"I disagreed with a fellow teacher or administrator (regarding teaching methods).\":\"Present calmly\",\"Engagement\":\"Weak interaction, strong effect\",\"New skill\":\"None\",\"High performers\":\"I asked him to be quiet until his colleague finished.\",\"Compensation\":\"I strongly agree\",\"Tech use\":\"No, use it\",\"AI homework\":\"Reject homework\",\"Integrate AI\":\"No, I don\'t use it and I prefer the traditional methods completely.\",\"AI app concerns\":\"The ease of use and design of the application.\",\"Age\":\"51+\",\"Experience\":\"2yrs\",\"Gender\":\"Male\",\"Teacher for the stage\":\"Primary\",\"Languages\":\"Arabic;English\",\"chronic disease\":\"No\"}','REJECTED',99.5,49.0,'هذا المعلم يستوفي معايير القبول.','[{\"feature\":\"Technology usage\",\"key\":\"Tech use\",\"value\":0.1464},{\"feature\":\"Handling disruptive students\",\"key\":\"Disruptive\",\"value\":0.0729},{\"feature\":\"New skill learned\",\"key\":\"New skill\",\"value\":0.0454},{\"feature\":\"Handling parent objections\",\"key\":\"Parent objections\",\"value\":0.0289}]','[{\"feature\":\"AI tool integration\",\"key\":\"Integrate AI\",\"value\":-0.0158},{\"feature\":\"Gender\",\"key\":\"Gender\",\"value\":-0.0065},{\"feature\":\"Teaching weaker students\",\"key\":\"slow learners\",\"value\":-0.0048}]','[\"ادمج أدوات الـ AI في التدريس نفسه، مش بس في التحضير.\",\"كيّف أسلوب الشرح حسب مستوى كل طالب.\",\"حسّن استخدام التكنولوجيا الفعّال داخل الفصل.\"]','completed',NULL,'2026-06-24 00:21:40','2026-06-24 00:21:41'),(7,23,'{\"Disruptive\":\"Calm then explain\",\"slow learners\":\"Adjust by level\",\"Disinterested\":\"Encouragement\",\"Parent objections\":\"Explain calmly\",\"I noticed that one of the students\' performance levels started to decline and he became withdrawn.\":\"Talk support\",\"I disagreed with a fellow teacher or administrator (regarding teaching methods).\":\"Present calmly\",\"Engagement\":\"Weak interaction, strong effect\",\"New skill\":\"None\",\"High performers\":\"I asked him to be quiet until his colleague finished.\",\"Compensation\":\"I strongly agree\",\"Tech use\":\"No, use it\",\"AI homework\":\"Reject homework\",\"Integrate AI\":\"No, I don\'t use it and I prefer the traditional methods completely.\",\"AI app concerns\":\"The ease of use and design of the application.\",\"Age\":\"51+\",\"Experience\":\"2yrs\",\"Gender\":\"Male\",\"Teacher for the stage\":\"Primary\",\"Languages\":\"Arabic;English\",\"chronic disease\":\"No\"}','REJECTED',99.5,49.0,'هذا المعلم يستوفي معايير القبول.','[{\"feature\":\"Technology usage\",\"key\":\"Tech use\",\"value\":0.1464},{\"feature\":\"Handling disruptive students\",\"key\":\"Disruptive\",\"value\":0.0729},{\"feature\":\"New skill learned\",\"key\":\"New skill\",\"value\":0.0454},{\"feature\":\"Handling parent objections\",\"key\":\"Parent objections\",\"value\":0.0289}]','[{\"feature\":\"AI tool integration\",\"key\":\"Integrate AI\",\"value\":-0.0158},{\"feature\":\"Gender\",\"key\":\"Gender\",\"value\":-0.0065},{\"feature\":\"Teaching weaker students\",\"key\":\"slow learners\",\"value\":-0.0048}]','[\"ادمج أدوات الـ AI في التدريس نفسه، مش بس في التحضير.\",\"كيّف أسلوب الشرح حسب مستوى كل طالب.\",\"حسّن استخدام التكنولوجيا الفعّال داخل الفصل.\"]','completed',NULL,'2026-06-24 00:22:56','2026-06-24 00:22:56'),(8,24,'{\"Disruptive\":\"Calm then explain\",\"slow learners\":\"Adjust by level\",\"Disinterested\":\"Encouragement\",\"Parent objections\":\"Explain calmly\",\"I noticed that one of the students\' performance levels started to decline and he became withdrawn.\":\"Talk support\",\"I disagreed with a fellow teacher or administrator (regarding teaching methods).\":\"Present calmly\",\"Engagement\":\"Weak interaction, strong effect\",\"New skill\":\"None\",\"High performers\":\"I asked him to be quiet until his colleague finished.\",\"Compensation\":\"I strongly agree\",\"Tech use\":\"No, use it\",\"AI homework\":\"Reject homework\",\"Integrate AI\":\"No, I don\'t use it and I prefer the traditional methods completely.\",\"AI app concerns\":\"The ease of use and design of the application.\",\"Age\":\"26-30\",\"Experience\":\"1yr\",\"Gender\":\"Male\",\"Teacher for the stage\":\"Primary\",\"Languages\":\"Arabic;English\",\"chronic disease\":\"No\"}','REJECTED',99.5,49.0,'هذا المعلم لا يستوفي معايير القبول حاليًا.','[{\"feature\":\"Technology usage\",\"key\":\"Tech use\",\"value\":0.1464},{\"feature\":\"Handling disruptive students\",\"key\":\"Disruptive\",\"value\":0.0729},{\"feature\":\"New skill learned\",\"key\":\"New skill\",\"value\":0.0454},{\"feature\":\"Handling parent objections\",\"key\":\"Parent objections\",\"value\":0.0289}]','[{\"feature\":\"AI tool integration\",\"key\":\"Integrate AI\",\"value\":-0.0158},{\"feature\":\"Gender\",\"key\":\"Gender\",\"value\":-0.0065},{\"feature\":\"Teaching weaker students\",\"key\":\"slow learners\",\"value\":-0.0048}]','[\"ادمج أدوات الـ AI في التدريس نفسه، مش بس في التحضير.\",\"كيّف أسلوب الشرح حسب مستوى كل طالب.\",\"حسّن استخدام التكنولوجيا الفعّال داخل الفصل.\"]','completed',NULL,'2026-06-24 22:26:25','2026-06-24 22:26:29');
/*!40000 ALTER TABLE `assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certifications`
--

DROP TABLE IF EXISTS `certifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `certifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `issuing_org` varchar(200) DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `credential_id` varchar(100) DEFAULT NULL,
  `credential_url` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certifications`
--

LOCK TABLES `certifications` WRITE;
/*!40000 ALTER TABLE `certifications` DISABLE KEYS */;
INSERT INTO `certifications` VALUES (1,2,'يسؤيس','ؤؤؤؤ','2026-06-09','0000-00-00','','','','2026-06-22 09:08:58','2026-06-22 09:08:58');
/*!40000 ALTER TABLE `certifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contactmessages`
--

DROP TABLE IF EXISTS `contactmessages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contactmessages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `subject` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `status` enum('new','read','replied') DEFAULT 'new',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contactmessages`
--

LOCK TABLES `contactmessages` WRITE;
/*!40000 ALTER TABLE `contactmessages` DISABLE KEYS */;
INSERT INTO `contactmessages` VALUES (1,'QA Tester','qa@test.com','QA Test','This is an automated QA test message.','new','2026-06-23 21:43:13','2026-06-23 21:43:13');
/*!40000 ALTER TABLE `contactmessages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `education`
--

DROP TABLE IF EXISTS `education`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `education` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `degree` varchar(100) NOT NULL,
  `institution` varchar(200) NOT NULL,
  `field` varchar(100) DEFAULT NULL,
  `start_year` int(11) DEFAULT NULL,
  `end_year` int(11) DEFAULT NULL,
  `grade` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `education`
--

LOCK TABLES `education` WRITE;
/*!40000 ALTER TABLE `education` DISABLE KEYS */;
INSERT INTO `education` VALUES (1,10,'قق','قق',NULL,NULL,2005,NULL,NULL,'2026-06-23 16:37:18','2026-06-23 16:37:18');
/*!40000 ALTER TABLE `education` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `payment_id` int(11) NOT NULL,
  `subscription_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'EGP',
  `plan_name` varchar(100) NOT NULL,
  `billing_period_start` datetime DEFAULT NULL,
  `billing_period_end` datetime DEFAULT NULL,
  `status` enum('issued','void') DEFAULT 'issued',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matches`
--

DROP TABLE IF EXISTS `matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `matches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) DEFAULT NULL,
  `school_id` int(11) DEFAULT NULL,
  `job_id` int(11) DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `insight` text DEFAULT NULL,
  `tags` longtext DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matches`
--

LOCK TABLES `matches` WRITE;
/*!40000 ALTER TABLE `matches` DISABLE KEYS */;
/*!40000 ALTER TABLE `matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `sender_name` varchar(200) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `subject` varchar(200) DEFAULT NULL,
  `body` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `job_id` int(11) DEFAULT NULL,
  `job_title` varchar(100) DEFAULT NULL,
  `type` enum('general','interview_invite','offer','rejection') DEFAULT 'general',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `Notification_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Teacher_ID` int(11) NOT NULL,
  `Type` varchar(100) NOT NULL,
  `Title` varchar(255) NOT NULL,
  `Message` text NOT NULL,
  `IsRead` tinyint(1) DEFAULT 0,
  `Related_ID` int(11) DEFAULT NULL COMMENT 'Job_ID, subscription id, or other reference depending on Type',
  `Related_School_ID` int(11) DEFAULT NULL COMMENT 'Post.School_ID when notification is job/application related',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`Notification_ID`),
  KEY `notifications__teacher__i_d` (`Teacher_ID`),
  KEY `notifications__teacher__i_d__is_read` (`Teacher_ID`,`IsRead`),
  KEY `notifications__type` (`Type`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,2,'application_received','Application Submitted','Your application for \"arabic\" has been submitted successfully.',0,1,1,'2026-06-22 00:19:15','2026-06-22 00:19:15'),(2,1,'new_application','New Job Application','A teacher has applied for your job \"arabic\".',0,1,1,'2026-06-22 00:19:15','2026-06-22 00:19:15'),(3,2,'status_update','Application Update','You\'ve been shortlisted for the position of \"arabic\".',0,1,1,'2026-06-22 00:34:53','2026-06-22 00:34:53'),(4,2,'status_update','Application Update','Congratulations! You\'ve been shortlisted for an interview for \"arabic\".',0,1,1,'2026-06-22 00:35:12','2026-06-22 00:35:12'),(5,2,'job_match','New Job Match','A new job \"math teacher\" matches your specialization and experience.',0,1,1,'2026-06-22 11:58:46','2026-06-22 11:58:46'),(6,2,'job_match','New Job Match','A new job \"arabic teacher\" matches your specialization and experience.',0,2,3,'2026-06-22 12:01:06','2026-06-22 12:01:06'),(7,2,'job_match','New Job Match','A new job \"Science\" matches your specialization and experience.',0,3,3,'2026-06-22 12:02:11','2026-06-22 12:02:11'),(8,8,'application_received','Application Submitted','Your application for \"Science\" has been submitted successfully.',0,3,3,'2026-06-23 11:44:15','2026-06-23 11:44:15'),(9,3,'new_application','New Job Application','A teacher has applied for your job \"Science\".',0,3,3,'2026-06-23 11:44:16','2026-06-23 11:44:16'),(10,8,'status_update','Application Update','You\'ve been shortlisted for the position of \"Science\".',0,3,3,'2026-06-23 11:45:02','2026-06-23 11:45:02'),(11,8,'status_update','Application Update','Congratulations! You\'ve been shortlisted for an interview for \"Science\".',0,3,3,'2026-06-23 11:45:08','2026-06-23 11:45:08'),(12,8,'status_update','Application Update','Great news! You\'ve been accepted for the position of \"Science\".',0,3,3,'2026-06-23 11:45:10','2026-06-23 11:45:10'),(13,10,'application_received','Application Submitted','Your application for \"Science\" has been submitted successfully.',0,3,3,'2026-06-23 16:36:15','2026-06-23 16:36:15'),(14,3,'new_application','New Job Application','A teacher has applied for your job \"Science\".',0,3,3,'2026-06-23 16:36:15','2026-06-23 16:36:15'),(15,2,'job_match','New Job Match','A new job \"head team arabic teacher\" matches your specialization and experience.',0,1,1,'2026-06-23 17:56:53','2026-06-23 17:56:53'),(16,4,'job_match','New Job Match','A new job \"head team arabic teacher\" matches your specialization and experience.',0,1,NULL,'2026-06-23 17:56:53','2026-06-23 17:56:53'),(17,5,'job_match','New Job Match','A new job \"head team arabic teacher\" matches your specialization and experience.',0,1,NULL,'2026-06-23 17:56:53','2026-06-23 17:56:53'),(18,6,'job_match','New Job Match','A new job \"head team arabic teacher\" matches your specialization and experience.',0,1,NULL,'2026-06-23 17:56:53','2026-06-23 17:56:53'),(19,8,'job_match','New Job Match','A new job \"head team arabic teacher\" matches your specialization and experience.',0,1,NULL,'2026-06-23 17:56:53','2026-06-23 17:56:53'),(20,9,'job_match','New Job Match','A new job \"head team arabic teacher\" matches your specialization and experience.',0,1,NULL,'2026-06-23 17:56:53','2026-06-23 17:56:53'),(21,10,'job_match','New Job Match','A new job \"head team arabic teacher\" matches your specialization and experience.',0,1,NULL,'2026-06-23 17:56:53','2026-06-23 17:56:53'),(22,12,'job_match','New Job Match','A new job \"head team arabic teacher\" matches your specialization and experience.',0,1,NULL,'2026-06-23 17:56:53','2026-06-23 17:56:53'),(23,2,'job_match','New Job Match','A new job \"head team science\" matches your specialization and experience.',0,2,NULL,'2026-06-23 17:58:27','2026-06-23 17:58:27'),(24,4,'job_match','New Job Match','A new job \"head team science\" matches your specialization and experience.',0,2,NULL,'2026-06-23 17:58:27','2026-06-23 17:58:27'),(25,5,'job_match','New Job Match','A new job \"head team science\" matches your specialization and experience.',0,2,NULL,'2026-06-23 17:58:27','2026-06-23 17:58:27'),(26,6,'job_match','New Job Match','A new job \"head team science\" matches your specialization and experience.',0,2,NULL,'2026-06-23 17:58:27','2026-06-23 17:58:27'),(27,8,'job_match','New Job Match','A new job \"head team science\" matches your specialization and experience.',0,2,NULL,'2026-06-23 17:58:27','2026-06-23 17:58:27'),(28,9,'job_match','New Job Match','A new job \"head team science\" matches your specialization and experience.',0,2,NULL,'2026-06-23 17:58:27','2026-06-23 17:58:27'),(29,10,'job_match','New Job Match','A new job \"head team science\" matches your specialization and experience.',0,2,NULL,'2026-06-23 17:58:27','2026-06-23 17:58:27'),(30,12,'job_match','New Job Match','A new job \"head team science\" matches your specialization and experience.',0,2,NULL,'2026-06-23 17:58:27','2026-06-23 17:58:27'),(31,2,'job_match','New Job Match','A new job \"english \" matches your specialization and experience.',0,3,NULL,'2026-06-23 17:59:34','2026-06-23 17:59:34'),(32,4,'job_match','New Job Match','A new job \"english \" matches your specialization and experience.',0,3,NULL,'2026-06-23 17:59:34','2026-06-23 17:59:34'),(33,5,'job_match','New Job Match','A new job \"english \" matches your specialization and experience.',0,3,NULL,'2026-06-23 17:59:34','2026-06-23 17:59:34'),(34,6,'job_match','New Job Match','A new job \"english \" matches your specialization and experience.',0,3,NULL,'2026-06-23 17:59:34','2026-06-23 17:59:34'),(35,8,'job_match','New Job Match','A new job \"english \" matches your specialization and experience.',0,3,3,'2026-06-23 17:59:34','2026-06-23 17:59:34'),(36,9,'job_match','New Job Match','A new job \"english \" matches your specialization and experience.',0,3,NULL,'2026-06-23 17:59:34','2026-06-23 17:59:34'),(37,10,'job_match','New Job Match','A new job \"english \" matches your specialization and experience.',0,3,3,'2026-06-23 17:59:34','2026-06-23 17:59:34'),(38,12,'job_match','New Job Match','A new job \"english \" matches your specialization and experience.',0,3,NULL,'2026-06-23 17:59:34','2026-06-23 17:59:34'),(39,14,'application_received','Application Submitted','Your application for \"english \" has been submitted successfully.',0,3,13,'2026-06-23 19:54:29','2026-06-23 19:54:29'),(40,13,'new_application','New Job Application','A teacher has applied for your job \"english \".',0,3,13,'2026-06-23 19:54:29','2026-06-23 19:54:29'),(41,14,'status_update','Application Update','Great news! You\'ve been accepted for the position of \"english \".',0,3,13,'2026-06-23 19:55:39','2026-06-23 19:55:39'),(42,10,'job_match','New Job Match','A new job \"Mathematics Teacher\" matches your specialization and experience.',0,1,NULL,'2026-06-23 21:40:54','2026-06-23 21:40:54'),(43,17,'job_match','New Job Match','A new job \"Mathematics Teacher\" matches your specialization and experience.',0,1,NULL,'2026-06-23 21:40:54','2026-06-23 21:40:54'),(44,17,'application_received','Application Submitted','Your application for \"Mathematics Teacher\" has been submitted successfully.',0,1,16,'2026-06-23 21:41:23','2026-06-23 21:41:23'),(45,16,'new_application','New Job Application','A teacher has applied for your job \"Mathematics Teacher\".',0,1,16,'2026-06-23 21:41:23','2026-06-23 21:41:23'),(46,2,'job_match','New Job Match','A new job \"Temp Job to Delete\" matches your specialization and experience.',0,2,NULL,'2026-06-23 21:42:05','2026-06-23 21:42:05'),(47,4,'job_match','New Job Match','A new job \"Temp Job to Delete\" matches your specialization and experience.',0,2,NULL,'2026-06-23 21:42:05','2026-06-23 21:42:05'),(48,5,'job_match','New Job Match','A new job \"Temp Job to Delete\" matches your specialization and experience.',0,2,NULL,'2026-06-23 21:42:05','2026-06-23 21:42:05'),(49,6,'job_match','New Job Match','A new job \"Temp Job to Delete\" matches your specialization and experience.',0,2,NULL,'2026-06-23 21:42:05','2026-06-23 21:42:05'),(50,8,'job_match','New Job Match','A new job \"Temp Job to Delete\" matches your specialization and experience.',0,2,NULL,'2026-06-23 21:42:05','2026-06-23 21:42:05'),(51,9,'job_match','New Job Match','A new job \"Temp Job to Delete\" matches your specialization and experience.',0,2,NULL,'2026-06-23 21:42:05','2026-06-23 21:42:05'),(52,10,'job_match','New Job Match','A new job \"Temp Job to Delete\" matches your specialization and experience.',0,2,NULL,'2026-06-23 21:42:05','2026-06-23 21:42:05'),(53,12,'job_match','New Job Match','A new job \"Temp Job to Delete\" matches your specialization and experience.',0,2,NULL,'2026-06-23 21:42:05','2026-06-23 21:42:05'),(54,14,'job_match','New Job Match','A new job \"Temp Job to Delete\" matches your specialization and experience.',0,2,NULL,'2026-06-23 21:42:05','2026-06-23 21:42:05'),(55,17,'job_match','New Job Match','A new job \"Temp Job to Delete\" matches your specialization and experience.',0,2,NULL,'2026-06-23 21:42:06','2026-06-23 21:42:06'),(56,17,'status_update','Application Status Updated','Your application status changed from \"pending\" to \"interview\".',0,1,16,'2026-06-23 21:43:11','2026-06-23 21:43:11'),(57,16,'profile_view','Profile View','Someone viewed your profile.',0,NULL,NULL,'2026-06-23 21:44:33','2026-06-23 21:44:33'),(58,23,'application_received','Application Submitted','Your application for \"arabic\" has been submitted successfully.',0,1,1,'2026-06-23 23:56:32','2026-06-23 23:56:32'),(59,1,'new_application','New Job Application','A teacher has applied for your job \"arabic\".',0,1,1,'2026-06-23 23:56:32','2026-06-23 23:56:32'),(60,8,'status_update','Application Update','Congratulations! You\'ve been shortlisted for an interview for \"Science\".',0,3,3,'2026-06-24 00:07:36','2026-06-24 00:07:36'),(61,10,'status_update','Application Update','We\'re sorry, your application for \"Science\" was not selected this time.',0,3,3,'2026-06-24 22:55:36','2026-06-24 22:55:36'),(62,8,'status_update','Application Update','Great news! You\'ve been accepted for the position of \"Science\".',0,3,3,'2026-06-24 22:55:39','2026-06-24 22:55:39'),(63,10,'status_update','Application Update','Great news! You\'ve been accepted for the position of \"Science\".',0,3,3,'2026-06-24 22:55:41','2026-06-24 22:55:41'),(64,2,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,4,3,'2026-06-24 22:56:33','2026-06-24 22:56:33'),(65,4,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,4,3,'2026-06-24 22:56:33','2026-06-24 22:56:33'),(66,5,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,4,3,'2026-06-24 22:56:33','2026-06-24 22:56:33'),(67,6,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,4,3,'2026-06-24 22:56:33','2026-06-24 22:56:33'),(68,8,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,4,3,'2026-06-24 22:56:33','2026-06-24 22:56:33'),(69,9,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,4,3,'2026-06-24 22:56:33','2026-06-24 22:56:33'),(70,10,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,4,3,'2026-06-24 22:56:33','2026-06-24 22:56:33'),(71,12,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,4,3,'2026-06-24 22:56:33','2026-06-24 22:56:33'),(72,14,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,4,3,'2026-06-24 22:56:33','2026-06-24 22:56:33'),(73,17,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,4,3,'2026-06-24 22:56:33','2026-06-24 22:56:33'),(74,19,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,4,3,'2026-06-24 22:56:33','2026-06-24 22:56:33'),(75,20,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,4,3,'2026-06-24 22:56:33','2026-06-24 22:56:33'),(76,21,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,4,3,'2026-06-24 22:56:33','2026-06-24 22:56:33'),(77,22,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,4,3,'2026-06-24 22:56:33','2026-06-24 22:56:33'),(78,23,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,4,3,'2026-06-24 22:56:33','2026-06-24 22:56:33'),(79,24,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,4,3,'2026-06-24 22:56:33','2026-06-24 22:56:33'),(80,2,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,5,3,'2026-06-24 22:56:36','2026-06-24 22:56:36'),(81,4,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,5,3,'2026-06-24 22:56:36','2026-06-24 22:56:36'),(82,5,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,5,3,'2026-06-24 22:56:36','2026-06-24 22:56:36'),(83,6,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,5,3,'2026-06-24 22:56:36','2026-06-24 22:56:36'),(84,8,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,5,3,'2026-06-24 22:56:36','2026-06-24 22:56:36'),(85,9,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,5,3,'2026-06-24 22:56:36','2026-06-24 22:56:36'),(86,10,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,5,3,'2026-06-24 22:56:36','2026-06-24 22:56:36'),(87,12,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,5,3,'2026-06-24 22:56:36','2026-06-24 22:56:36'),(88,14,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,5,3,'2026-06-24 22:56:36','2026-06-24 22:56:36'),(89,17,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,5,3,'2026-06-24 22:56:36','2026-06-24 22:56:36'),(90,19,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,5,3,'2026-06-24 22:56:36','2026-06-24 22:56:36'),(91,20,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,5,3,'2026-06-24 22:56:36','2026-06-24 22:56:36'),(92,21,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,5,3,'2026-06-24 22:56:36','2026-06-24 22:56:36'),(93,22,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,5,3,'2026-06-24 22:56:36','2026-06-24 22:56:36'),(94,23,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,5,3,'2026-06-24 22:56:36','2026-06-24 22:56:36'),(95,24,'job_match','New Job Match','A new job \"english\" matches your specialization and experience.',0,5,3,'2026-06-24 22:56:36','2026-06-24 22:56:36');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subscription_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'EGP',
  `provider` enum('instapay','vodafone_cash','orange_cash','manual','free') NOT NULL,
  `status` enum('pending','paid','failed','expired','refunded') NOT NULL DEFAULT 'pending',
  `transaction_ref` varchar(100) NOT NULL,
  `provider_ref` varchar(200) DEFAULT NULL,
  `provider_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`provider_response`)),
  `paid_at` datetime DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `verified_by` varchar(100) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `payment_proof` varchar(500) DEFAULT NULL,
  `failure_reason` varchar(500) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_ref` (`transaction_ref`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,24,149.00,'EGP','instapay','pending','TXN-20260624-C12C1ECB','INSTAPAY-MOCK-1782341566748','{\"mock\":true}',NULL,NULL,NULL,'2026-06-25 22:52:46',NULL,NULL,'2026-06-24 22:52:46','2026-06-24 22:52:46');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `post` (
  `School_ID` int(11) NOT NULL COMMENT 'FK to Teacher.Teacher_ID (school account)',
  `Job_ID` int(11) NOT NULL COMMENT 'Per-school job sequence (not globally unique)',
  `Title` varchar(100) NOT NULL,
  `Location` varchar(200) DEFAULT NULL,
  `Subjects` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`Subjects`)),
  `Specialization` varchar(100) DEFAULT NULL,
  `Required_Stage` enum('Kindergarten','Primary School','Middle School','High School') DEFAULT NULL,
  `Job_Type` enum('full-time','part-time','freelance','contract') DEFAULT 'full-time',
  `Required_Experience` int(11) DEFAULT 0,
  `Required_Qualifications` text DEFAULT NULL,
  `Start_Date` date DEFAULT NULL,
  `Deadline` date DEFAULT NULL,
  `Salary_Range` varchar(100) DEFAULT NULL,
  `Content` text DEFAULT NULL,
  `Description` text DEFAULT NULL,
  `Responsibilities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`Responsibilities`)),
  `Requirements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`Requirements`)),
  `Benefits` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`Benefits`)),
  `Teaching_Style` enum('strict','flexible','structured','free-flowing') DEFAULT NULL,
  `Classroom_Energy` enum('calm','energetic','collaborative','playful','balanced') DEFAULT NULL,
  `Leadership_Style` enum('leader','supporter','collaborator','mentor') DEFAULT NULL,
  `Communication_Style` enum('direct','empathetic','formal','casual') DEFAULT NULL,
  `Problem_Solving` enum('analytical','creative','practical','innovative') DEFAULT NULL,
  `Date` date DEFAULT NULL,
  `Status` enum('active','closed','draft','rejected') DEFAULT 'active',
  `Applicants_Count` int(11) DEFAULT 0,
  `School_Rating` decimal(3,2) DEFAULT 0.00,
  PRIMARY KEY (`School_ID`,`Job_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post`
--

LOCK TABLES `post` WRITE;
/*!40000 ALTER TABLE `post` DISABLE KEYS */;
INSERT INTO `post` VALUES (1,1,'arabic','Matrouh, Marsa Matrouh','[\"Arabic\"]',NULL,NULL,'full-time',0,NULL,NULL,NULL,'2000',NULL,NULL,NULL,NULL,NULL,'structured','playful','supporter','empathetic','creative','2026-06-22','active',2,0.00),(3,1,'math teacher','Alexandria, Alexandria','[\"Mathematics\"]',NULL,NULL,'full-time',0,NULL,'2026-06-10',NULL,'5000',NULL,NULL,NULL,NULL,NULL,'strict','energetic','supporter','empathetic','analytical','2026-06-22','active',0,0.00),(3,2,'arabic teacher','Alexandria, Alexandria','[\"Arabic\"]',NULL,NULL,'full-time',0,NULL,NULL,NULL,'6000',NULL,NULL,NULL,NULL,NULL,'free-flowing','playful','leader','empathetic','creative','2026-06-22','active',0,0.00),(3,3,'Science','Alexandria, Alexandria','[\"Science\"]',NULL,NULL,'full-time',0,NULL,NULL,NULL,'7000',NULL,NULL,NULL,NULL,NULL,'strict','calm','leader','direct','analytical','2026-06-22','active',2,0.00),(3,4,'english','Alexandria, Alexandria','[\"English\"]',NULL,'Primary School','full-time',0,NULL,NULL,NULL,'200',NULL,NULL,NULL,NULL,NULL,'flexible','balanced','mentor','casual','creative','2026-06-25','active',0,0.00),(3,5,'english','Alexandria, Alexandria','[\"English\"]',NULL,'Primary School','full-time',0,NULL,NULL,NULL,'200',NULL,NULL,NULL,NULL,NULL,'flexible','balanced','mentor','casual','creative','2026-06-25','active',0,0.00),(13,1,'head team arabic teacher','Alexandria, Alexandria','[\"Arabic\"]',NULL,NULL,'full-time',0,NULL,NULL,NULL,'5000',NULL,NULL,NULL,NULL,NULL,'flexible','energetic','leader','formal','analytical','2026-06-23','active',0,0.00),(13,2,'head team science','Alexandria, Alexandria','[\"Science\"]',NULL,NULL,'full-time',0,NULL,NULL,NULL,'3.5',NULL,NULL,NULL,NULL,NULL,'structured','playful','leader','casual','practical','2026-06-23','active',0,0.00),(13,3,'english ','Matrouh, Marsa Matrouh','[\"English\"]',NULL,NULL,'full-time',0,NULL,NULL,NULL,'400',NULL,NULL,NULL,NULL,NULL,'structured','balanced','collaborator','empathetic','innovative','2026-06-23','active',1,0.00),(16,1,'Senior Mathematics Teacher','Cairo','[\"Mathematics\",\"Physics\"]',NULL,NULL,'full-time',3,'BSc Mathematics','2026-09-01',NULL,'5000-8000 EGP',NULL,'Full-time position for secondary level',NULL,NULL,NULL,'structured','energetic','','direct','analytical','2026-06-24','active',1,0.00);
/*!40000 ALTER TABLE `post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reviewer_id` int(11) NOT NULL,
  `reviewer_name` varchar(200) NOT NULL,
  `reviewer_type` enum('school','teacher') DEFAULT 'school',
  `teacher_id` int(11) DEFAULT NULL,
  `rating` decimal(2,1) NOT NULL,
  `comment` text DEFAULT NULL,
  `job_title` varchar(100) DEFAULT NULL,
  `job_id` int(11) DEFAULT NULL,
  `is_visible` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,0,'Alice Tester','school',0,4.0,'Excellent platform for teachers!',NULL,NULL,1,'2026-06-23 19:59:33','2026-06-23 19:59:33'),(2,0,'Anonymous','school',0,5.0,NULL,NULL,NULL,1,'2026-06-23 21:43:11','2026-06-23 21:43:11'),(3,16,'Nile International School','school',17,4.0,'Excellent candidate with strong math skills.','Senior Mathematics Teacher',1,1,'2026-06-23 21:43:12','2026-06-23 21:43:12'),(4,0,'nnnnnnn','school',0,1.0,'asdfaserfserfse',NULL,NULL,1,'2026-06-24 00:00:02','2026-06-24 00:00:02');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `savedjobs`
--

DROP TABLE IF EXISTS `savedjobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `savedjobs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Teacher_ID` int(11) DEFAULT NULL,
  `School_ID` int(11) DEFAULT NULL,
  `Job_ID` int(11) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `saved_unique` (`Teacher_ID`,`School_ID`,`Job_ID`),
  UNIQUE KEY `saved_jobs__teacher__i_d__school__i_d__job__i_d` (`Teacher_ID`,`School_ID`,`Job_ID`),
  KEY `saved_jobs__teacher__i_d` (`Teacher_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `savedjobs`
--

LOCK TABLES `savedjobs` WRITE;
/*!40000 ALTER TABLE `savedjobs` DISABLE KEYS */;
INSERT INTO `savedjobs` VALUES (1,2,1,1,'2026-06-22 00:19:24','2026-06-22 00:19:24');
/*!40000 ALTER TABLE `savedjobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptionplans`
--

DROP TABLE IF EXISTS `subscriptionplans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subscriptionplans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `plan_key` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `target_role` enum('teacher','school') NOT NULL,
  `price_egp` decimal(10,2) NOT NULL DEFAULT 0.00,
  `duration_days` int(11) NOT NULL DEFAULT 30,
  `billing_cycle` enum('monthly','yearly','lifetime') DEFAULT 'monthly',
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `max_applications` int(11) DEFAULT -1,
  `max_job_posts` int(11) DEFAULT -1,
  `is_active` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `plan_key` (`plan_key`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptionplans`
--

LOCK TABLES `subscriptionplans` WRITE;
/*!40000 ALTER TABLE `subscriptionplans` DISABLE KEYS */;
INSERT INTO `subscriptionplans` VALUES (1,'teacher_free','Teacher Free','teacher',0.00,30,'monthly','[\"Up to 5 job applications per month\",\"Basic teacher profile\",\"Browse all job listings\",\"Email notifications\"]',5,0,1,'2026-06-22 00:10:42','2026-06-24 22:20:47'),(2,'teacher_pro','Teacher Pro','teacher',149.00,30,'monthly','[\"Unlimited job applications\",\"Priority profile visibility\",\"Advanced analytics dashboard\",\"Job match notifications\",\"Application status tracking\",\"Priority customer support\"]',-1,0,1,'2026-06-22 00:10:42','2026-06-24 22:20:47'),(3,'school_starter','School Starter','school',299.00,30,'monthly','[\"Post up to 5 job listings per month\",\"Basic teacher matching\",\"View teacher profiles\",\"Application management\",\"Email notifications\"]',0,5,1,'2026-06-22 00:10:42','2026-06-24 22:20:47'),(4,'school_pro','School Pro','school',599.00,30,'monthly','[\"Unlimited job postings\",\"Advanced teacher matching (by score, experience, specialization)\",\"Detailed analytics & reports\",\"Bulk teacher search\",\"Featured school listing\",\"Priority customer support\",\"API access\"]',0,-1,1,'2026-06-22 00:10:42','2026-06-24 22:20:47');
/*!40000 ALTER TABLE `subscriptionplans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `status` enum('active','cancelled','expired','pending_payment') NOT NULL DEFAULT 'pending_payment',
  `started_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `price_paid` decimal(10,2) DEFAULT NULL,
  `auto_renew` tinyint(1) DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
INSERT INTO `subscriptions` VALUES (1,24,2,'pending_payment',NULL,NULL,NULL,149.00,0,NULL,'2026-06-24 22:52:46','2026-06-24 22:52:46');
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher`
--

DROP TABLE IF EXISTS `teacher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teacher` (
  `Teacher_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Date_of_Birth` date DEFAULT NULL,
  `Gender` varchar(10) DEFAULT NULL,
  `Qualifications` varchar(200) DEFAULT NULL,
  `Specialization` varchar(100) DEFAULT NULL,
  `Years_of_Experience` int(11) DEFAULT 0,
  `Big5_Score` decimal(5,2) DEFAULT NULL,
  `Image` varchar(500) DEFAULT NULL,
  `Role` enum('teacher','school') NOT NULL DEFAULT 'teacher',
  `Bio` text DEFAULT NULL,
  `Location` varchar(200) DEFAULT NULL,
  `Governorate` varchar(100) DEFAULT NULL,
  `Auth_Provider` varchar(20) DEFAULT 'local',
  `Nationality` varchar(100) DEFAULT NULL,
  `CV_File` varchar(500) DEFAULT NULL COMMENT 'Public URL path e.g. /uploads/cvs/cv-123.pdf',
  `Profile_Completion` int(11) DEFAULT 0,
  `Big5_Scores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`Big5_Scores`)),
  `Average_Rating` decimal(3,2) DEFAULT 0.00,
  `Total_Reviews` int(11) DEFAULT 0,
  `School_Name` varchar(200) DEFAULT NULL,
  `School_Type` varchar(100) DEFAULT NULL,
  `School_Size` int(11) DEFAULT NULL,
  `Is_Available` tinyint(1) DEFAULT 1,
  `Job_Type_Preference` varchar(50) DEFAULT NULL,
  `Expected_Salary` varchar(100) DEFAULT NULL,
  `LinkedIn_URL` varchar(500) DEFAULT NULL,
  `Website_URL` varchar(500) DEFAULT NULL,
  `Reset_Token` varchar(255) DEFAULT NULL,
  `Reset_Token_Expiry` datetime DEFAULT NULL,
  `Survey_Classroom_Management` text DEFAULT NULL,
  `Survey_Professional_Skills` text DEFAULT NULL,
  `Survey_AI_Technology` text DEFAULT NULL,
  `Survey_Submitted_At` datetime DEFAULT NULL,
  `Founded_Year` int(11) DEFAULT NULL,
  `Core_Values` text DEFAULT NULL,
  `Academic_Programs` text DEFAULT NULL,
  `Achievements` text DEFAULT NULL,
  `Teacher_Stage` enum('Kindergarten','Primary School','Middle School','High School') DEFAULT NULL,
  PRIMARY KEY (`Teacher_ID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher`
--

LOCK TABLES `teacher` WRITE;
/*!40000 ALTER TABLE `teacher` DISABLE KEYS */;
INSERT INTO `teacher` VALUES (1,'محسن','teacher22@gmail.com','$2a$10$WSuiABS/ZbeaqKghJnWZpOKJvOcmlnQXfirieXT.0gfWHtvS2DZCW','01550315136',NULL,NULL,NULL,NULL,0,NULL,'/uploads/profiles/profileImage-1782087431368.jpg','school','','Marsa Matrouh','Matrouh','local',NULL,NULL,0,NULL,0.00,0,'القومية 2','Public',50,1,NULL,NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'سشء','سشءشسء','بيلاربللال',NULL),(2,'Hazem Mamdouh','teacher111@gmail.com','$2a$10$Bf4sqt10ie3cxayEQmnNxOv2V.RKk9QUty4N4ZLGAW5MGQpVn2SNC','01550315136','2026-06-23','male','','arabic',2,94.00,'uploads\\profiles\\image-1782119542371.jpg','teacher','','Port Said','Port Said','local','مصري','/uploads/cvs/cv-1782087509847.pdf',83,'{\"classroom\":100,\"professional\":95,\"tech\":86,\"overall\":94,\"stage\":\"primary\",\"personality_type\":\"visionary_catalyst\",\"trait_profile\":{\"patience\":96.7,\"empathy\":96.7,\"creativity\":88.3,\"leadership\":85,\"communication\":93.8,\"discipline\":46.2,\"analytical_thinking\":92,\"child_engagement\":100},\"evaluationLevel\":\"Excellent\"}',0.00,0,NULL,NULL,NULL,1,'Full-time','','','',NULL,NULL,'{\"1\":\"Talk to them individually and understand them\",\"2\":\"Adjust my teaching method to suit the student\'s level\",\"3\":\"Design engaging activities to motivate everyone\",\"4\":\"Calmly explain the grading system\",\"5\":\"Talk to them to understand the reason and support them\"}','{\"6\":\"Present my point of view calmly\",\"7\":\"Interaction is excellent and density doesn\'t affect my teaching quality\",\"8\":\"I learned a skill and apply it consistently in class\",\"9\":\"Give them additional questions and challenges\",\"10\":\"Agree\"}','{\"11\":\"Effectively\",\"12\":\"Discuss the written content with them to verify understanding\",\"13\":\"I use them in class to create interactive activities with students\",\"14\":\"Student data safety and privacy on the app\"}','2026-06-23 20:24:38',NULL,NULL,NULL,NULL,NULL),(3,'المحسنيه','school1@gmail.com','$2a$10$YdPMxgGqMTvEVX6wuyFxTOhvAFD0jnLoWzMGbn7QashOa.MV6UylK','01550315136',NULL,NULL,NULL,NULL,0,NULL,NULL,'school','','Alexandria','Alexandria','local',NULL,NULL,0,NULL,0.00,0,'المحسنيه','Private',0,1,NULL,NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'سيؤس','سيؤ','سؤي',NULL),(4,'ali mohsn','mohsn1@gmail.com','$2a$10$AxIe9y5ublUkhLvaHs48be/TA3IRDiH/0NYfqEMyBJKQ2ilIDSgwm','+201550315136','0000-00-00','male','','math',2,NULL,'uploads\\profiles\\image-1782129908448.jpg','teacher','','Alexandria','Alexandria','local','egypt','/uploads/cvs/cv-1782129796051.pdf',67,NULL,0.00,0,NULL,NULL,NULL,1,'','','','',NULL,NULL,'{\"1\":\"Calm them down and explain classroom rules\",\"2\":\"Adjust my teaching method to suit the student\'s level\",\"3\":\"Use encouragement methods and incentives\",\"4\":\"Calmly explain the grading system\",\"5\":\"Talk to them to understand the reason and support them\"}','{\"6\":\"Present my point of view calmly\",\"7\":\"Interaction is weak and density strongly affects it\",\"8\":\"I haven\'t learned a new skill recently\",\"9\":\"Ask them to stay quiet until classmates finish\",\"10\":\"Strongly agree\"}','{\"11\":\"I don\'t use it\",\"12\":\"Reject the assignment immediately and give a zero\",\"13\":\"I don\'t use them and prefer traditional methods entirely\",\"14\":\"Ease of use and the app\'s interface\"}','2026-06-22 12:04:05',NULL,NULL,NULL,NULL,NULL),(5,'mohsen','mohsn2@gmail.com','$2a$10$9M.sI6CNjr.613u4bwtRiucISOxX7TG6i63Y9lvxNm8gci7H9iPO6','+201550315136','0000-00-00','male','','math',2,NULL,NULL,'teacher','','Alexandria','Alexandria','local','','/uploads/cvs/cv-1782130098626.pdf',58,NULL,0.00,0,NULL,NULL,NULL,1,'Part-time','','','',NULL,NULL,'{\"1\":\"Calm them down and explain classroom rules\",\"2\":\"Adjust my teaching method to suit the student\'s level\",\"3\":\"Use encouragement methods and incentives\",\"4\":\"Calmly explain the grading system\",\"5\":\"Talk to them to understand the reason and support them\"}','{\"6\":\"Present my point of view calmly\",\"7\":\"Interaction is weak and density strongly affects it\",\"8\":\"I haven\'t learned a new skill recently\",\"9\":\"Ask them to stay quiet until classmates finish\",\"10\":\"Strongly agree\"}','{\"11\":\"I don\'t use it\",\"12\":\"Reject the assignment immediately and give a zero\",\"13\":\"I don\'t use them and prefer traditional methods entirely\",\"14\":\"Ease of use and the app\'s interface\"}','2026-06-22 12:08:57',NULL,NULL,NULL,NULL,NULL),(6,'science','science@gmail.com','$2a$10$NVx.pBgz6Vhqyk.16cIQDuVZBso49OlFJhPTfRgY8Vi9LdAyaQpvC','+201550315136','0000-00-00','male','science teacher ','science',2,NULL,NULL,'teacher','','Alexandria','Alexandria','local','','/uploads/cvs/cv-1782130295781.pdf',67,NULL,0.00,0,NULL,NULL,NULL,1,'Part-time','2','','',NULL,NULL,'{\"1\":\"Calm them down and explain classroom rules\",\"2\":\"Adjust my teaching method to suit the student\'s level\",\"3\":\"Use encouragement methods and incentives\",\"4\":\"Calmly explain the grading system\",\"5\":\"Talk to them to understand the reason and support them\"}','{\"6\":\"Present my point of view calmly\",\"7\":\"Interaction is weak and density strongly affects it\",\"8\":\"I haven\'t learned a new skill recently\",\"9\":\"Ask them to stay quiet until classmates finish\",\"10\":\"Strongly agree\"}','{\"11\":\"I don\'t use it\",\"12\":\"Reject the assignment immediately and give a zero\",\"13\":\"I don\'t use them and prefer traditional methods entirely\",\"14\":\"Ease of use and the app\'s interface\"}','2026-06-22 12:12:09',NULL,NULL,NULL,NULL,NULL),(7,'helwan','helwan@gmail.com','$2a$10$6tGX0cdz63pw7.TUjis4YeHxAxmTG7oxAjaNcYZC1HaVuMuNBbnoa',NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'school',NULL,'Helwan','Cairo','local',NULL,NULL,0,NULL,0.00,0,NULL,'Language',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,'Hazem Mamdouh','school5@gmail.com','$2a$10$LEbbp3kXxz.gy.RpN6B9kulI.2dkZIGoTZ4b5nAenHFAbD.JDQOeC','+201550315136','0000-00-00','male','','math',2,NULL,NULL,'teacher','','Alexandria','Alexandria','local','','/uploads/cvs/cv-1782214925011.pdf',58,NULL,0.00,0,NULL,NULL,NULL,1,'','','','',NULL,NULL,'{\"1\":\"Calm them down and explain classroom rules\",\"2\":\"Adjust my teaching method to suit the student\'s level\",\"3\":\"Use encouragement methods and incentives\",\"4\":\"Calmly explain the grading system\",\"5\":\"Talk to them to understand the reason and support them\"}','{\"6\":\"Present my point of view calmly\",\"7\":\"Interaction is weak and density strongly affects it\",\"8\":\"I haven\'t learned a new skill recently\",\"9\":\"Ask them to stay quiet until classmates finish\",\"10\":\"Strongly agree\"}','{\"11\":\"I don\'t use it\",\"12\":\"Reject the assignment immediately and give a zero\",\"13\":\"I don\'t use them and prefer traditional methods entirely\",\"14\":\"Ease of use and the app\'s interface\"}','2026-06-23 11:42:40',NULL,NULL,NULL,NULL,NULL),(9,'Hazem Mamdouh','school6@gmail.com','$2a$10$MA12TCsjPqUfgOlarNRyGeD5xXPmXri1pHUbLXxT9KQUcTHjwQ6Fa','+201550315136','0000-00-00','male','','science',1,NULL,NULL,'teacher','','alexandria','','local','','/uploads/cvs/cv-1782215178113.pdf',58,NULL,0.00,0,NULL,NULL,NULL,1,'Full-time','','','',NULL,NULL,'{\"1\":\"Talk to them individually and understand them\",\"2\":\"Explain in the same way\",\"3\":\"Forcefully ask them to participate\",\"4\":\"Apply the policy directly\",\"5\":\"Adjust my approach to meet their needs\"}','{\"6\":\"Comply with the policy to avoid conflict\",\"7\":\"Interaction is good and density somewhat affects it\",\"8\":\"I learned a skill and started applying it occasionally\",\"9\":\"Give them additional questions and challenges\",\"10\":\"Neutral\"}','{\"11\":\"Sometimes\",\"12\":\"Discuss the written content with them to verify understanding\",\"13\":\"I use them in class to create interactive activities with students\",\"14\":\"Student data safety and privacy on the app\"}','2026-06-23 11:46:55',NULL,NULL,NULL,NULL,NULL),(10,'مصطفى احمد رشيدي حسن','mostafarashidy93@gmail.com','$2a$10$ESK4ih1tQmWVy2sE9XyGTOzdykRkFT6/sFxJ7anhW2agXTsg5H2LS','01281801197',NULL,'male',NULL,'رررر',4,NULL,'uploads\\profiles\\image-1782232638215.jpg','teacher','بؤبب','رررر',NULL,'local',NULL,'/uploads/cvs/cv-1782231342210.pdf',92,NULL,0.00,0,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,'mostafa Ahmed','mostafarashidy9993@gmail.com','$2a$10$m.IXibMqx72SIBKsEKETsuHepNx4aNNEiw1ZMuDmMCMW1hpFFF1sy',NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'school',NULL,'Alexandria','Alexandria','local',NULL,NULL,0,NULL,0.00,0,NULL,'Experimental',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,'مصطفى احمد رشيدي حسن','mostafarashidy8893@gmail.com','$2a$10$Qc4Ufnj6alfsCmE2UnDKXuo7SpUbor.C2D3ld5k/M93S8VmfI1q/S','01281801197','0000-00-00','male','','arabic',2,NULL,'uploads\\profiles\\image-1782237142911.jpg','teacher','','alexandria','','local','','/uploads/cvs/cv-1782236981031.pdf',67,NULL,0.00,0,NULL,NULL,NULL,1,'','','','',NULL,NULL,'{\"1\":\"Calm them down and explain classroom rules\",\"2\":\"Adjust my teaching method to suit the student\'s level\",\"3\":\"Use encouragement methods and incentives\",\"4\":\"Calmly explain the grading system\",\"5\":\"Talk to them to understand the reason and support them\"}','{\"6\":\"Present my point of view calmly\",\"7\":\"Interaction is weak and density strongly affects it\",\"8\":\"I haven\'t learned a new skill recently\",\"9\":\"Ask them to stay quiet until classmates finish\",\"10\":\"Strongly agree\"}','{\"11\":\"I don\'t use it\",\"12\":\"Reject the assignment immediately and give a zero\",\"13\":\"I don\'t use them and prefer traditional methods entirely\",\"14\":\"Ease of use and the app\'s interface\"}','2026-06-23 17:50:21',NULL,NULL,NULL,NULL,NULL),(13,'‪mostafa Ahmed‬‏','mostafarashidy55593@gmail.com','$2a$10$I1rlE7fpW06Lb4J/QEWAxufsB5AQFzxPjDvVTmmk8afYLPlVicyHu',NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'school',NULL,'Alexandria','Alexandria','local',NULL,NULL,0,NULL,0.00,0,NULL,'Public',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,'مصطفى احمد رشيدي حسن','techer1@gmail.com','$2a$10$At/eX91pIQhBMTxJIt264uoExp7zx25gtBk0D56GbZRe7s1UHoVP6','01281801197','0000-00-00','male','','english',2,NULL,'uploads\\profiles\\image-1782237876430.jpg','teacher','','alexandria','','local','','/uploads/cvs/cv-1782237806090.pdf',67,NULL,0.00,0,NULL,NULL,NULL,1,'','','','',NULL,NULL,'{\"1\":\"Always\",\"2\":\"Often\",\"3\":\"Always\",\"4\":\"Sometimes\",\"5\":\"Always\"}','{\"6\":\"Always\",\"7\":\"Often\",\"8\":\"Always\",\"9\":\"Often\",\"10\":\"Always\"}','{\"11\":\"Always\",\"12\":\"Often\",\"13\":\"Always\",\"14\":\"Often\"}','2026-06-23 20:00:04',NULL,NULL,NULL,NULL,NULL),(15,'TestSchool_RT','rt_school@test.com','$2a$10$DQcCswVQ27LkyleLAzGEZuhwipsVnx9CUBAlis6za8anP4LpyswEO',NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'school',NULL,'Cairo',NULL,'local',NULL,NULL,0,NULL,0.00,0,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(16,'Nile International School','qa.school@ninjatest.com','$2a$10$2IySS/roj/g8ZAVYAqBU2.g6CSk2uSqon/WWPR88oLMtCGASGB4GC',NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'school',NULL,'Cairo',NULL,'local',NULL,NULL,0,NULL,0.00,0,NULL,'Private',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,'{\"1\":\"A\",\"2\":\"B\",\"3\":\"C\",\"4\":\"D\",\"5\":\"E\"}','{\"6\":\"F\",\"7\":\"G\",\"8\":\"H\",\"9\":\"I\",\"10\":\"J\"}','{\"11\":\"K\",\"12\":\"L\",\"13\":\"M\",\"14\":\"N\"}','2026-06-23 21:47:26',NULL,NULL,NULL,NULL,NULL),(17,'Ahmed Al-Rashidi','qa.teacher@ninjatest.com','$2a$10$wXKxWwJdGwMD3QaEeqmJj.wR2X67lUyXIGVT/JrXDpWrQNvh4pCjm',NULL,NULL,'male',NULL,'Mathematics',7,94.00,NULL,'teacher','<script>alert(1)</script>','Cairo, Egypt',NULL,'local',NULL,NULL,0,'{\"classroom\":100,\"professional\":95,\"tech\":86,\"overall\":94,\"stage\":\"primary\",\"personality_type\":\"visionary_catalyst\",\"trait_profile\":{\"patience\":96.7,\"empathy\":96.7,\"creativity\":88.3,\"leadership\":85,\"communication\":93.8,\"discipline\":46.2,\"analytical_thinking\":92,\"child_engagement\":100},\"evaluationLevel\":\"Excellent\"}',4.00,0,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,'{\"1\":\"Talk to them individually and understand them\",\"2\":\"Adjust my teaching method to suit the student\'s level\",\"3\":\"Design engaging activities to motivate everyone\",\"4\":\"Calmly explain the grading system\",\"5\":\"Talk to them to understand the reason and support them\"}','{\"6\":\"Present my point of view calmly\",\"7\":\"Interaction is excellent and density doesn\'t affect my teaching quality\",\"8\":\"I learned a skill and apply it consistently in class\",\"9\":\"Give them additional questions and challenges\",\"10\":\"Agree\"}','{\"11\":\"Effectively\",\"12\":\"Discuss the written content with them to verify understanding\",\"13\":\"I use them in class to create interactive activities with students\",\"14\":\"Student data safety and privacy on the app\"}','2026-06-23 21:38:47',NULL,NULL,NULL,NULL,NULL),(19,'‪mostafa Ahmed‬‏','teacher1@gmail.com','$2a$10$qb2kTbhkr2uy.2axiTge3eaP8R7AV.my942ToOJr8U9qW7yJGcbvy',NULL,NULL,'male',NULL,NULL,0,NULL,NULL,'teacher',NULL,NULL,NULL,'local',NULL,'/uploads/cvs/cv-1782258060332.pdf',0,NULL,0.00,0,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(20,'‪mostafa Ahmed‬‏','teacher155@gmail.com','$2a$10$syfazj31RqLBMziAknNYA.qjb0/KHr2LOxaSMyqgCfVOhvfo2voPm',NULL,NULL,'male',NULL,NULL,0,NULL,NULL,'teacher',NULL,NULL,NULL,'local',NULL,'/uploads/cvs/cv-1782258078879.pdf',0,NULL,0.00,0,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(21,'‪mostafa Ahmkdjhdfj‬‏','teacher15599999@gmail.com','$2a$10$ROaqJPZy9CYxo9ybMlLJ.ee/7YIeiLTUMK7hHH2I8P8F9y9IsTMT2',NULL,NULL,'male',NULL,NULL,0,NULL,NULL,'teacher',NULL,NULL,NULL,'local',NULL,'/uploads/cvs/cv-1782258419513.pdf',0,NULL,0.00,0,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(22,'‪mostafa Ahmed‬‏','mostafarashidy935555@gmail.com','$2a$10$.CzxkHGv5yvG6WGwylkSB..evTCIlORfSdGxwClwW55gmimaQYS7e',NULL,NULL,'male',NULL,NULL,0,NULL,NULL,'teacher',NULL,NULL,NULL,'local',NULL,'/uploads/cvs/cv-1782258679848.pdf',0,NULL,0.00,0,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(23,'mostafa','mostafa1@gmail.com','$2a$10$0ffH9F2fwaTUed5hXg/JBO1kfiec6pj0kq6zEIA9FEIwt7s.B/KU6','01203668801','0000-00-00','male','','arabic',2,49.00,'uploads\\profiles\\image-1782258925348.jpg','teacher','','Alexandria','Alexandria','local','','/uploads/cvs/cv-1782258775574.pdf',67,'{\"classroom\":87,\"professional\":44,\"tech\":17,\"overall\":49,\"stage\":\"primary\",\"personality_type\":\"emotional_leader\",\"trait_profile\":{\"patience\":90,\"empathy\":85,\"creativity\":48.3,\"leadership\":40,\"communication\":72.5,\"discipline\":68.8,\"analytical_thinking\":19,\"child_engagement\":73.8},\"evaluationLevel\":\"Average\"}',0.00,0,NULL,NULL,NULL,1,'','','','',NULL,NULL,'{\"1\":\"Calm them down and explain classroom rules\",\"2\":\"Adjust my teaching method to suit the student\'s level\",\"3\":\"Use encouragement methods and incentives\",\"4\":\"Calmly explain the grading system\",\"5\":\"Talk to them to understand the reason and support them\"}','{\"6\":\"Present my point of view calmly\",\"7\":\"Interaction is weak and density strongly affects it\",\"8\":\"I haven\'t learned a new skill recently\",\"9\":\"Ask them to stay quiet until classmates finish\",\"10\":\"Strongly agree\"}','{\"11\":\"I don\'t use it\",\"12\":\"Reject the assignment immediately and give a zero\",\"13\":\"I don\'t use them and prefer traditional methods entirely\",\"14\":\"Ease of use and the app\'s interface\"}','2026-06-24 00:22:56',NULL,NULL,NULL,NULL,NULL),(24,'shreef','shreef@gmail.com','$2a$10$cd8dQFzd4RFlrg3iqEr4o.Ueq5ucad.25npam8ehxU0050W/qrcg6','01281801197',NULL,'male',NULL,'arabic',2,49.00,'uploads\\profiles\\image-1782340027237.jpg','teacher','','alexandria',NULL,'local',NULL,'/uploads/cvs/cv-1782339944872.pdf',67,'{\"classroom\":87,\"professional\":44,\"tech\":17,\"overall\":49,\"stage\":\"primary\",\"personality_type\":\"emotional_leader\",\"trait_profile\":{\"patience\":90,\"empathy\":85,\"creativity\":48.3,\"leadership\":40,\"communication\":72.5,\"discipline\":68.8,\"analytical_thinking\":19,\"child_engagement\":73.8},\"evaluationLevel\":\"Average\"}',0.00,0,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,'{\"1\":\"Calm them down and explain classroom rules\",\"2\":\"Adjust my teaching method to suit the student\'s level\",\"3\":\"Use encouragement methods and incentives\",\"4\":\"Calmly explain the grading system\",\"5\":\"Talk to them to understand the reason and support them\"}','{\"6\":\"Present my point of view calmly\",\"7\":\"Interaction is weak and density strongly affects it\",\"8\":\"I haven\'t learned a new skill recently\",\"9\":\"Ask them to stay quiet until classmates finish\",\"10\":\"Strongly agree\"}','{\"11\":\"I don\'t use it\",\"12\":\"Reject the assignment immediately and give a zero\",\"13\":\"I don\'t use them and prefer traditional methods entirely\",\"14\":\"Ease of use and the app\'s interface\"}','2026-06-24 22:26:25',NULL,NULL,NULL,NULL,'Primary School');
/*!40000 ALTER TABLE `teacher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workexperience`
--

DROP TABLE IF EXISTS `workexperience`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workexperience` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `job_title` varchar(100) NOT NULL,
  `school_name` varchar(200) NOT NULL,
  `location` varchar(200) DEFAULT NULL,
  `subject` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) DEFAULT 0,
  `description` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workexperience`
--

LOCK TABLES `workexperience` WRITE;
/*!40000 ALTER TABLE `workexperience` DISABLE KEYS */;
INSERT INTO `workexperience` VALUES (1,2,'arabic','hgkdg','cairo','arabic','2026-06-24','2026-06-24',0,'','2026-06-22 09:12:58','2026-06-22 09:12:58'),(2,6,'scince teacher ','nile','alexandria','science','2026-06-25','2026-06-27',0,'','2026-06-22 12:13:52','2026-06-22 12:13:52'),(3,10,'ققق','ققق',NULL,NULL,'0000-00-00',NULL,0,NULL,'2026-06-23 16:37:18','2026-06-23 16:37:18');
/*!40000 ALTER TABLE `workexperience` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'school_jobs'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-25  2:14:21
