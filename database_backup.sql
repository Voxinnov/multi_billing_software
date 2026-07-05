-- MySQL dump 10.13  Distrib 8.4.7, for Win64 (x86_64)
--
-- Host: localhost    Database: rosys_billing_saas
-- ------------------------------------------------------
-- Server version	8.4.7

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_logs_user_id_foreign` (`user_id`),
  CONSTRAINT `activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
INSERT INTO `cache` VALUES ('rosys-billing-saas-cache-illuminate:queue:restart','i:1783246305;',2098606305);
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `vendor_id` bigint unsigned NOT NULL,
  `company_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gstin` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_line1` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_line2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pincode` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_branch` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account_no` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_ifsc` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signer_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `footer_text` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `companies_vendor_id_company_code_unique` (`vendor_id`,`company_code`),
  CONSTRAINT `companies_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (1,1,'ROSYS','Rosys Tech Solutions Pvt Ltd','32AABCR1234A1Z1','+91 8075082255','billing@rosystech.com','Phase 2, Carnation Towers','Infopark Kochi','Kochi','Kerala','India','682030','Federal Bank','Karimannoor','17160100001987','FDRL00002','Vishnu Mohan','Thank you for choosing Rosys Technologies. Enjoy our cloud platforms.',1,'2026-06-21 03:58:32','2026-07-05 08:41:33'),(2,1,'VOXINNOV','Voxinnov Systems','32AABCV5678B2Z2','+91 9876543210','accounts@voxinnov.in','2nd Floor, Innovation Hub','Civil Line Road','Kochi','Kerala','India','682021',NULL,NULL,NULL,NULL,NULL,'For billing queries, email finance@voxinnov.in.',1,'2026-06-21 03:58:32','2026-06-21 03:58:32'),(3,2,'ATTIRE','Attire Apparel Brands Inc.','32AABCA9012C3Z3','+1 (555) 123-4567','sales@attirebrands.com','500 Fashion Avenue','Suite 404','New York','NY','United States','10018',NULL,NULL,NULL,NULL,NULL,'All disputes are subject to New York jurisdiction.',1,'2026-06-21 03:58:32','2026-06-21 03:58:32');
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_assets`
--

DROP TABLE IF EXISTS `company_assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_assets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `asset_type` enum('logo','seal','signature') COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `company_assets_company_id_asset_type_asset_name_unique` (`company_id`,`asset_type`,`asset_name`),
  CONSTRAINT `company_assets_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_assets`
--

LOCK TABLES `company_assets` WRITE;
/*!40000 ALTER TABLE `company_assets` DISABLE KEYS */;
INSERT INTO `company_assets` VALUES (1,1,'logo','Logo 1','assets/mock/rosys_logo.png',1,'2026-06-21 03:58:32','2026-06-21 03:58:32'),(2,1,'seal','Blue Seal','assets/mock/rosys_seal.png',1,'2026-06-21 03:58:32','2026-06-21 03:58:32'),(3,1,'signature','Director Sign','assets/mock/rosys_sign.png',1,'2026-06-21 03:58:32','2026-06-21 03:58:32');
/*!40000 ALTER TABLE `company_assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
INSERT INTO `failed_jobs` VALUES (1,'10ec1379-f70f-4e44-a0cf-cf6d5a04f386','database','default','{\"uuid\":\"10ec1379-f70f-4e44-a0cf-cf6d5a04f386\",\"displayName\":\"App\\\\Jobs\\\\FinalizeInvoiceBatchJob\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"deleteWhenMissingModels\":false,\"data\":{\"commandName\":\"App\\\\Jobs\\\\FinalizeInvoiceBatchJob\",\"command\":\"O:32:\\\"App\\\\Jobs\\\\FinalizeInvoiceBatchJob\\\":1:{s:8:\\\"\\u0000*\\u0000batch\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:23:\\\"App\\\\Models\\\\InvoiceBatch\\\";s:2:\\\"id\\\";i:1;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}}\",\"batchId\":null},\"createdAt\":1782037571,\"delay\":null}','Error: Class \"FPDF\" not found in D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\setasign\\fpdi\\src\\FpdfTpl.php:18\nStack trace:\n#0 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\composer\\ClassLoader.php(576): include()\n#1 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\composer\\ClassLoader.php(427): Composer\\Autoload\\{closure}(\'D:\\\\VOXINNOV\\\\mul...\')\n#2 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\setasign\\fpdi\\src\\Fpdi.php(23): Composer\\Autoload\\ClassLoader->loadClass(\'setasign\\\\Fpdi\\\\F...\')\n#3 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\composer\\ClassLoader.php(576): include(\'D:\\\\VOXINNOV\\\\mul...\')\n#4 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\composer\\ClassLoader.php(427): Composer\\Autoload\\{closure}(\'D:\\\\VOXINNOV\\\\mul...\')\n#5 D:\\VOXINNOV\\multi_billing_software\\backend\\app\\Services\\PdfService.php(72): Composer\\Autoload\\ClassLoader->loadClass(\'setasign\\\\Fpdi\\\\F...\')\n#6 D:\\VOXINNOV\\multi_billing_software\\backend\\app\\Jobs\\FinalizeInvoiceBatchJob.php(43): App\\Services\\PdfService->mergePdfs(Array, \'batch_BATCH-CLI...\')\n#7 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(36): App\\Jobs\\FinalizeInvoiceBatchJob->handle(Object(App\\Services\\PdfService))\n#8 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Util.php(43): Illuminate\\Container\\BoundMethod::Illuminate\\Container\\{closure}()\n#9 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(96): Illuminate\\Container\\Util::unwrapIfClosure(Object(Closure))\n#10 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(35): Illuminate\\Container\\BoundMethod::callBoundMethod(Object(Illuminate\\Foundation\\Application), Array, Object(Closure))\n#11 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Container.php(799): Illuminate\\Container\\BoundMethod::call(Object(Illuminate\\Foundation\\Application), Array, Array, NULL)\n#12 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Bus\\Dispatcher.php(136): Illuminate\\Container\\Container->call(Array)\n#13 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(180): Illuminate\\Bus\\Dispatcher->Illuminate\\Bus\\{closure}(Object(App\\Jobs\\FinalizeInvoiceBatchJob))\n#14 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(137): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}(Object(App\\Jobs\\FinalizeInvoiceBatchJob))\n#15 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Bus\\Dispatcher.php(140): Illuminate\\Pipeline\\Pipeline->then(Object(Closure))\n#16 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\CallQueuedHandler.php(153): Illuminate\\Bus\\Dispatcher->dispatchNow(Object(App\\Jobs\\FinalizeInvoiceBatchJob), false)\n#17 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(180): Illuminate\\Queue\\CallQueuedHandler->Illuminate\\Queue\\{closure}(Object(App\\Jobs\\FinalizeInvoiceBatchJob))\n#18 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(137): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}(Object(App\\Jobs\\FinalizeInvoiceBatchJob))\n#19 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\CallQueuedHandler.php(146): Illuminate\\Pipeline\\Pipeline->then(Object(Closure))\n#20 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\CallQueuedHandler.php(84): Illuminate\\Queue\\CallQueuedHandler->dispatchThroughMiddleware(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Object(App\\Jobs\\FinalizeInvoiceBatchJob))\n#21 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Jobs\\Job.php(102): Illuminate\\Queue\\CallQueuedHandler->call(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Array)\n#22 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Worker.php(553): Illuminate\\Queue\\Jobs\\Job->fire()\n#23 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Worker.php(499): Illuminate\\Queue\\Worker->process(\'database\', Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Object(Illuminate\\Queue\\WorkerOptions))\n#24 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Worker.php(245): Illuminate\\Queue\\Worker->runJob(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), \'database\', Object(Illuminate\\Queue\\WorkerOptions))\n#25 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Console\\WorkCommand.php(149): Illuminate\\Queue\\Worker->daemon(\'database\', \'default\', Object(Illuminate\\Queue\\WorkerOptions))\n#26 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Console\\WorkCommand.php(132): Illuminate\\Queue\\Console\\WorkCommand->runWorker(\'database\', \'default\')\n#27 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(36): Illuminate\\Queue\\Console\\WorkCommand->handle()\n#28 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Util.php(43): Illuminate\\Container\\BoundMethod::Illuminate\\Container\\{closure}()\n#29 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(96): Illuminate\\Container\\Util::unwrapIfClosure(Object(Closure))\n#30 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(35): Illuminate\\Container\\BoundMethod::callBoundMethod(Object(Illuminate\\Foundation\\Application), Array, Object(Closure))\n#31 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Container.php(799): Illuminate\\Container\\BoundMethod::call(Object(Illuminate\\Foundation\\Application), Array, Array, NULL)\n#32 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Console\\Command.php(280): Illuminate\\Container\\Container->call(Array)\n#33 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\symfony\\console\\Command\\Command.php(341): Illuminate\\Console\\Command->execute(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Laravel\\Pao\\Laravel\\PaoOutputStyle))\n#34 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Console\\Command.php(249): Symfony\\Component\\Console\\Command\\Command->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Laravel\\Pao\\Laravel\\PaoOutputStyle))\n#35 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\symfony\\console\\Application.php(1117): Illuminate\\Console\\Command->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#36 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\symfony\\console\\Application.php(356): Symfony\\Component\\Console\\Application->doRunCommand(Object(Illuminate\\Queue\\Console\\WorkCommand), Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#37 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\symfony\\console\\Application.php(195): Symfony\\Component\\Console\\Application->doRun(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#38 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Foundation\\Console\\Kernel.php(198): Symfony\\Component\\Console\\Application->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#39 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Foundation\\Application.php(1235): Illuminate\\Foundation\\Console\\Kernel->handle(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#40 D:\\VOXINNOV\\multi_billing_software\\backend\\artisan(16): Illuminate\\Foundation\\Application->handleCommand(Object(Symfony\\Component\\Console\\Input\\ArgvInput))\n#41 {main}','2026-06-21 04:56:11'),(2,'5ca9d096-4fa1-4824-98f4-47b19f1fc484','database','default','{\"uuid\":\"5ca9d096-4fa1-4824-98f4-47b19f1fc484\",\"displayName\":\"App\\\\Jobs\\\\FinalizeInvoiceBatchJob\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"deleteWhenMissingModels\":false,\"data\":{\"commandName\":\"App\\\\Jobs\\\\FinalizeInvoiceBatchJob\",\"command\":\"O:32:\\\"App\\\\Jobs\\\\FinalizeInvoiceBatchJob\\\":1:{s:8:\\\"\\u0000*\\u0000batch\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:23:\\\"App\\\\Models\\\\InvoiceBatch\\\";s:2:\\\"id\\\";i:2;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}}\",\"batchId\":null},\"createdAt\":1782037621,\"delay\":null}','Error: Class \"FPDF\" not found in D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\setasign\\fpdi\\src\\FpdfTpl.php:18\nStack trace:\n#0 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\composer\\ClassLoader.php(576): include()\n#1 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\composer\\ClassLoader.php(427): Composer\\Autoload\\{closure}(\'D:\\\\VOXINNOV\\\\mul...\')\n#2 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\setasign\\fpdi\\src\\Fpdi.php(23): Composer\\Autoload\\ClassLoader->loadClass(\'setasign\\\\Fpdi\\\\F...\')\n#3 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\composer\\ClassLoader.php(576): include(\'D:\\\\VOXINNOV\\\\mul...\')\n#4 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\composer\\ClassLoader.php(427): Composer\\Autoload\\{closure}(\'D:\\\\VOXINNOV\\\\mul...\')\n#5 D:\\VOXINNOV\\multi_billing_software\\backend\\app\\Services\\PdfService.php(72): Composer\\Autoload\\ClassLoader->loadClass(\'setasign\\\\Fpdi\\\\F...\')\n#6 D:\\VOXINNOV\\multi_billing_software\\backend\\app\\Jobs\\FinalizeInvoiceBatchJob.php(43): App\\Services\\PdfService->mergePdfs(Array, \'batch_BATCH-CLI...\')\n#7 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(36): App\\Jobs\\FinalizeInvoiceBatchJob->handle(Object(App\\Services\\PdfService))\n#8 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Util.php(43): Illuminate\\Container\\BoundMethod::Illuminate\\Container\\{closure}()\n#9 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(96): Illuminate\\Container\\Util::unwrapIfClosure(Object(Closure))\n#10 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(35): Illuminate\\Container\\BoundMethod::callBoundMethod(Object(Illuminate\\Foundation\\Application), Array, Object(Closure))\n#11 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Container.php(799): Illuminate\\Container\\BoundMethod::call(Object(Illuminate\\Foundation\\Application), Array, Array, NULL)\n#12 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Bus\\Dispatcher.php(136): Illuminate\\Container\\Container->call(Array)\n#13 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(180): Illuminate\\Bus\\Dispatcher->Illuminate\\Bus\\{closure}(Object(App\\Jobs\\FinalizeInvoiceBatchJob))\n#14 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(137): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}(Object(App\\Jobs\\FinalizeInvoiceBatchJob))\n#15 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Bus\\Dispatcher.php(140): Illuminate\\Pipeline\\Pipeline->then(Object(Closure))\n#16 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\CallQueuedHandler.php(153): Illuminate\\Bus\\Dispatcher->dispatchNow(Object(App\\Jobs\\FinalizeInvoiceBatchJob), false)\n#17 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(180): Illuminate\\Queue\\CallQueuedHandler->Illuminate\\Queue\\{closure}(Object(App\\Jobs\\FinalizeInvoiceBatchJob))\n#18 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(137): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}(Object(App\\Jobs\\FinalizeInvoiceBatchJob))\n#19 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\CallQueuedHandler.php(146): Illuminate\\Pipeline\\Pipeline->then(Object(Closure))\n#20 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\CallQueuedHandler.php(84): Illuminate\\Queue\\CallQueuedHandler->dispatchThroughMiddleware(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Object(App\\Jobs\\FinalizeInvoiceBatchJob))\n#21 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Jobs\\Job.php(102): Illuminate\\Queue\\CallQueuedHandler->call(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Array)\n#22 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Worker.php(553): Illuminate\\Queue\\Jobs\\Job->fire()\n#23 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Worker.php(499): Illuminate\\Queue\\Worker->process(\'database\', Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Object(Illuminate\\Queue\\WorkerOptions))\n#24 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Worker.php(245): Illuminate\\Queue\\Worker->runJob(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), \'database\', Object(Illuminate\\Queue\\WorkerOptions))\n#25 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Console\\WorkCommand.php(149): Illuminate\\Queue\\Worker->daemon(\'database\', \'default\', Object(Illuminate\\Queue\\WorkerOptions))\n#26 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Console\\WorkCommand.php(132): Illuminate\\Queue\\Console\\WorkCommand->runWorker(\'database\', \'default\')\n#27 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(36): Illuminate\\Queue\\Console\\WorkCommand->handle()\n#28 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Util.php(43): Illuminate\\Container\\BoundMethod::Illuminate\\Container\\{closure}()\n#29 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(96): Illuminate\\Container\\Util::unwrapIfClosure(Object(Closure))\n#30 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(35): Illuminate\\Container\\BoundMethod::callBoundMethod(Object(Illuminate\\Foundation\\Application), Array, Object(Closure))\n#31 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Container.php(799): Illuminate\\Container\\BoundMethod::call(Object(Illuminate\\Foundation\\Application), Array, Array, NULL)\n#32 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Console\\Command.php(280): Illuminate\\Container\\Container->call(Array)\n#33 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\symfony\\console\\Command\\Command.php(341): Illuminate\\Console\\Command->execute(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Laravel\\Pao\\Laravel\\PaoOutputStyle))\n#34 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Console\\Command.php(249): Symfony\\Component\\Console\\Command\\Command->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Laravel\\Pao\\Laravel\\PaoOutputStyle))\n#35 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\symfony\\console\\Application.php(1117): Illuminate\\Console\\Command->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#36 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\symfony\\console\\Application.php(356): Symfony\\Component\\Console\\Application->doRunCommand(Object(Illuminate\\Queue\\Console\\WorkCommand), Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#37 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\symfony\\console\\Application.php(195): Symfony\\Component\\Console\\Application->doRun(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#38 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Foundation\\Console\\Kernel.php(198): Symfony\\Component\\Console\\Application->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#39 D:\\VOXINNOV\\multi_billing_software\\backend\\vendor\\laravel\\framework\\src\\Illuminate\\Foundation\\Application.php(1235): Illuminate\\Foundation\\Console\\Kernel->handle(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#40 D:\\VOXINNOV\\multi_billing_software\\backend\\artisan(16): Illuminate\\Foundation\\Application->handleCommand(Object(Symfony\\Component\\Console\\Input\\ArgvInput))\n#41 {main}','2026-06-21 04:57:01');
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_batches`
--

DROP TABLE IF EXISTS `invoice_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_batches` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `vendor_id` bigint unsigned NOT NULL,
  `company_id` bigint unsigned DEFAULT NULL,
  `logo_asset_id` bigint unsigned DEFAULT NULL,
  `seal_asset_id` bigint unsigned DEFAULT NULL,
  `sign_asset_id` bigint unsigned DEFAULT NULL,
  `batch_no` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_count` int NOT NULL DEFAULT '0',
  `pdf_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zip_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','processing','completed','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `gst_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `gst_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `generated_by` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_batches_batch_no_unique` (`batch_no`),
  KEY `invoice_batches_vendor_id_foreign` (`vendor_id`),
  KEY `invoice_batches_generated_by_foreign` (`generated_by`),
  KEY `invoice_batches_company_id_foreign` (`company_id`),
  KEY `invoice_batches_logo_asset_id_foreign` (`logo_asset_id`),
  KEY `invoice_batches_seal_asset_id_foreign` (`seal_asset_id`),
  KEY `invoice_batches_sign_asset_id_foreign` (`sign_asset_id`),
  CONSTRAINT `invoice_batches_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoice_batches_generated_by_foreign` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoice_batches_logo_asset_id_foreign` FOREIGN KEY (`logo_asset_id`) REFERENCES `company_assets` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoice_batches_seal_asset_id_foreign` FOREIGN KEY (`seal_asset_id`) REFERENCES `company_assets` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoice_batches_sign_asset_id_foreign` FOREIGN KEY (`sign_asset_id`) REFERENCES `company_assets` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoice_batches_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_batches`
--

LOCK TABLES `invoice_batches` WRITE;
/*!40000 ALTER TABLE `invoice_batches` DISABLE KEYS */;
INSERT INTO `invoice_batches` VALUES (7,1,1,1,2,3,'BATCH-20260705142543-9137',3,'batches/batch_BATCH-20260705142543-9137_merged.pdf','batches/batch_BATCH-20260705142543-9137_invoices.zip','completed',0,18.00,2,'2026-07-05 08:55:43','2026-07-05 08:55:45'),(8,1,1,1,2,3,'BATCH-20260705142617-7822',3,'batches/batch_BATCH-20260705142617-7822_merged.pdf','batches/batch_BATCH-20260705142617-7822_invoices.zip','completed',0,18.00,2,'2026-07-05 08:56:17','2026-07-05 08:56:19');
/*!40000 ALTER TABLE `invoice_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_items`
--

DROP TABLE IF EXISTS `invoice_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint unsigned NOT NULL,
  `item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rate` decimal(12,2) NOT NULL,
  `qty` int NOT NULL,
  `tax_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `taxable_value` decimal(12,2) NOT NULL,
  `tax_amount` decimal(12,2) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoice_items_invoice_id_foreign` (`invoice_id`),
  CONSTRAINT `invoice_items_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_items`
--

LOCK TABLES `invoice_items` WRITE;
/*!40000 ALTER TABLE `invoice_items` DISABLE KEYS */;
INSERT INTO `invoice_items` VALUES (22,16,'Consulting fee for May',5000.00,1,0.00,5000.00,0.00,5000.00,'2026-07-05 08:55:45','2026-07-05 08:55:45'),(23,17,'Web design project',12500.50,1,0.00,12500.50,0.00,12500.50,'2026-07-05 08:55:45','2026-07-05 08:55:45'),(24,18,'Office supplies',800.00,1,0.00,800.00,0.00,800.00,'2026-07-05 08:55:45','2026-07-05 08:55:45'),(25,19,'Consulting fee for May',5000.00,1,0.00,5000.00,0.00,5000.00,'2026-07-05 08:56:19','2026-07-05 08:56:19'),(26,20,'Web design project',12500.50,1,0.00,12500.50,0.00,12500.50,'2026-07-05 08:56:19','2026-07-05 08:56:19'),(27,21,'Office supplies',800.00,1,0.00,800.00,0.00,800.00,'2026-07-05 08:56:19','2026-07-05 08:56:19');
/*!40000 ALTER TABLE `invoice_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `vendor_id` bigint unsigned NOT NULL,
  `batch_id` bigint unsigned NOT NULL,
  `company_id` bigint unsigned NOT NULL,
  `invoice_no` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_address` text COLLATE utf8mb4_unicode_ci,
  `customer_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `place_of_supply` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `grand_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `pdf_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoices_vendor_id_foreign` (`vendor_id`),
  KEY `invoices_batch_id_foreign` (`batch_id`),
  KEY `invoices_company_id_foreign` (`company_id`),
  CONSTRAINT `invoices_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `invoice_batches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoices_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoices_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (16,1,7,1,'RCT-20260705-0004','2026-06-01','2026-06-01','Ramesh Kumar','','','',5000.00,0.00,5000.00,'','invoices/RCT-20260705-0004_1783261545.pdf','2026-07-05 08:55:45','2026-07-05 08:55:45'),(17,1,7,1,'RCT-20260705-0005','2026-06-05','2026-06-05','Priya Sharma','','','',12500.50,0.00,12500.50,'','invoices/RCT-20260705-0005_1783261545.pdf','2026-07-05 08:55:45','2026-07-05 08:55:45'),(18,1,7,1,'RCT-20260705-0006','2026-06-10','2026-06-10','Anil Traders','','','',800.00,0.00,800.00,'','invoices/RCT-20260705-0006_1783261545.pdf','2026-07-05 08:55:45','2026-07-05 08:55:45'),(19,1,8,1,'RCT-20260705-0007','2026-06-01','2026-06-01','Ramesh Kumar','','','',5000.00,0.00,5000.00,'','invoices/RCT-20260705-0007_1783261579.pdf','2026-07-05 08:56:19','2026-07-05 08:56:19'),(20,1,8,1,'RCT-20260705-0008','2026-06-05','2026-06-05','Priya Sharma','','','',12500.50,0.00,12500.50,'','invoices/RCT-20260705-0008_1783261579.pdf','2026-07-05 08:56:19','2026-07-05 08:56:19'),(21,1,8,1,'RCT-20260705-0009','2026-06-10','2026-06-10','Anil Traders','','','',800.00,0.00,800.00,'','invoices/RCT-20260705-0009_1783261579.pdf','2026-07-05 08:56:19','2026-07-05 08:56:19');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
INSERT INTO `job_batches` VALUES ('a2134ba2-58fc-41ab-a47d-ecd59408b7a3','Rosys Bulk PDF: #BATCH-CLI-20260621102609',3,0,0,'[]','a:2:{s:4:\"then\";a:1:{i:0;O:47:\"Laravel\\SerializableClosure\\SerializableClosure\":1:{s:12:\"serializable\";O:46:\"Laravel\\SerializableClosure\\Serializers\\Signed\":2:{s:12:\"serializable\";s:838:\"O:46:\"Laravel\\SerializableClosure\\Serializers\\Native\":5:{s:3:\"use\";a:2:{s:7:\"batchId\";i:1;s:8:\"tempFile\";s:33:\"temp_imports/Sample_Invoices.xlsx\";}s:8:\"function\";s:551:\"function (\\Illuminate\\Bus\\Batch $busBatch) use ($batchId, $tempFile) {\n                    $invoiceBatch = \\App\\Models\\InvoiceBatch::find($batchId);\n                    if ($invoiceBatch) {\n                        // All individual PDFs are complete, trigger merging and zipping\n                        dispatch(new \\App\\Jobs\\FinalizeInvoiceBatchJob($invoiceBatch));\n                    }\n                    // Clean up temporary excel file\n                    \\Illuminate\\Support\\Facades\\Storage::disk(\'public\')->delete($tempFile);\n                }\";s:5:\"scope\";s:31:\"App\\Jobs\\ProcessInvoiceBatchJob\";s:4:\"this\";N;s:4:\"self\";s:32:\"00000000000007140000000000000000\";}\";s:4:\"hash\";s:44:\"MC3vAiQ61Jn78qbMcDDP04W8NvyeZxZRpdSUd1DxTfo=\";}}}s:5:\"catch\";a:1:{i:0;O:47:\"Laravel\\SerializableClosure\\SerializableClosure\":1:{s:12:\"serializable\";O:46:\"Laravel\\SerializableClosure\\Serializers\\Signed\":2:{s:12:\"serializable\";s:869:\"O:46:\"Laravel\\SerializableClosure\\Serializers\\Native\":5:{s:3:\"use\";a:2:{s:7:\"batchId\";i:1;s:8:\"tempFile\";s:33:\"temp_imports/Sample_Invoices.xlsx\";}s:8:\"function\";s:582:\"function (\\Illuminate\\Bus\\Batch $busBatch, \\Throwable $e) use ($batchId, $tempFile) {\n                    \\Illuminate\\Support\\Facades\\Log::error(\"Bulk PDF job batch execution failed: \" . $e->getMessage());\n                    $invoiceBatch = \\App\\Models\\InvoiceBatch::find($batchId);\n                    if ($invoiceBatch) {\n                        $invoiceBatch->update([\n                            \'status\' => \'failed\',\n                        ]);\n                    }\n                    \\Illuminate\\Support\\Facades\\Storage::disk(\'public\')->delete($tempFile);\n                }\";s:5:\"scope\";s:31:\"App\\Jobs\\ProcessInvoiceBatchJob\";s:4:\"this\";N;s:4:\"self\";s:32:\"00000000000006470000000000000000\";}\";s:4:\"hash\";s:44:\"bJb0QHzUcRbDAri2cg2p7h2hyCsjphMvZAFnm1fmd6I=\";}}}}',NULL,1782037570,1782037571),('a2134bee-f784-40bd-88ea-ea3c82fb1261','Rosys Bulk PDF: #BATCH-CLI-20260621102659',3,0,0,'[]','a:2:{s:4:\"then\";a:1:{i:0;O:47:\"Laravel\\SerializableClosure\\SerializableClosure\":1:{s:12:\"serializable\";O:46:\"Laravel\\SerializableClosure\\Serializers\\Signed\":2:{s:12:\"serializable\";s:838:\"O:46:\"Laravel\\SerializableClosure\\Serializers\\Native\":5:{s:3:\"use\";a:2:{s:7:\"batchId\";i:2;s:8:\"tempFile\";s:33:\"temp_imports/Sample_Invoices.xlsx\";}s:8:\"function\";s:551:\"function (\\Illuminate\\Bus\\Batch $busBatch) use ($batchId, $tempFile) {\n                    $invoiceBatch = \\App\\Models\\InvoiceBatch::find($batchId);\n                    if ($invoiceBatch) {\n                        // All individual PDFs are complete, trigger merging and zipping\n                        dispatch(new \\App\\Jobs\\FinalizeInvoiceBatchJob($invoiceBatch));\n                    }\n                    // Clean up temporary excel file\n                    \\Illuminate\\Support\\Facades\\Storage::disk(\'public\')->delete($tempFile);\n                }\";s:5:\"scope\";s:31:\"App\\Jobs\\ProcessInvoiceBatchJob\";s:4:\"this\";N;s:4:\"self\";s:32:\"0000000000000fd10000000000000000\";}\";s:4:\"hash\";s:44:\"q+ye9KZf0+gIKX7xcjcz5ht5ff2eqjEWYspZJalKFyg=\";}}}s:5:\"catch\";a:1:{i:0;O:47:\"Laravel\\SerializableClosure\\SerializableClosure\":1:{s:12:\"serializable\";O:46:\"Laravel\\SerializableClosure\\Serializers\\Signed\":2:{s:12:\"serializable\";s:869:\"O:46:\"Laravel\\SerializableClosure\\Serializers\\Native\":5:{s:3:\"use\";a:2:{s:7:\"batchId\";i:2;s:8:\"tempFile\";s:33:\"temp_imports/Sample_Invoices.xlsx\";}s:8:\"function\";s:582:\"function (\\Illuminate\\Bus\\Batch $busBatch, \\Throwable $e) use ($batchId, $tempFile) {\n                    \\Illuminate\\Support\\Facades\\Log::error(\"Bulk PDF job batch execution failed: \" . $e->getMessage());\n                    $invoiceBatch = \\App\\Models\\InvoiceBatch::find($batchId);\n                    if ($invoiceBatch) {\n                        $invoiceBatch->update([\n                            \'status\' => \'failed\',\n                        ]);\n                    }\n                    \\Illuminate\\Support\\Facades\\Storage::disk(\'public\')->delete($tempFile);\n                }\";s:5:\"scope\";s:31:\"App\\Jobs\\ProcessInvoiceBatchJob\";s:4:\"this\";N;s:4:\"self\";s:32:\"00000000000011320000000000000000\";}\";s:4:\"hash\";s:44:\"fH/cp3O3lWeEHnIZ9bEPzAQwScgeqcxKGXE9ftKvFyg=\";}}}}',NULL,1782037620,1782037621),('a2134c13-c495-4369-8fde-8abdbba700f1','Rosys Bulk PDF: #BATCH-CLI-20260621102720',3,0,0,'[]','a:2:{s:4:\"then\";a:1:{i:0;O:47:\"Laravel\\SerializableClosure\\SerializableClosure\":1:{s:12:\"serializable\";O:46:\"Laravel\\SerializableClosure\\Serializers\\Signed\":2:{s:12:\"serializable\";s:838:\"O:46:\"Laravel\\SerializableClosure\\Serializers\\Native\":5:{s:3:\"use\";a:2:{s:7:\"batchId\";i:3;s:8:\"tempFile\";s:33:\"temp_imports/Sample_Invoices.xlsx\";}s:8:\"function\";s:551:\"function (\\Illuminate\\Bus\\Batch $busBatch) use ($batchId, $tempFile) {\n                    $invoiceBatch = \\App\\Models\\InvoiceBatch::find($batchId);\n                    if ($invoiceBatch) {\n                        // All individual PDFs are complete, trigger merging and zipping\n                        dispatch(new \\App\\Jobs\\FinalizeInvoiceBatchJob($invoiceBatch));\n                    }\n                    // Clean up temporary excel file\n                    \\Illuminate\\Support\\Facades\\Storage::disk(\'public\')->delete($tempFile);\n                }\";s:5:\"scope\";s:31:\"App\\Jobs\\ProcessInvoiceBatchJob\";s:4:\"this\";N;s:4:\"self\";s:32:\"00000000000007230000000000000000\";}\";s:4:\"hash\";s:44:\"P65DNJEJW20eLfjkX9/kG6Q5mfVNDSLO0efGtsJalDE=\";}}}s:5:\"catch\";a:1:{i:0;O:47:\"Laravel\\SerializableClosure\\SerializableClosure\":1:{s:12:\"serializable\";O:46:\"Laravel\\SerializableClosure\\Serializers\\Signed\":2:{s:12:\"serializable\";s:869:\"O:46:\"Laravel\\SerializableClosure\\Serializers\\Native\":5:{s:3:\"use\";a:2:{s:7:\"batchId\";i:3;s:8:\"tempFile\";s:33:\"temp_imports/Sample_Invoices.xlsx\";}s:8:\"function\";s:582:\"function (\\Illuminate\\Bus\\Batch $busBatch, \\Throwable $e) use ($batchId, $tempFile) {\n                    \\Illuminate\\Support\\Facades\\Log::error(\"Bulk PDF job batch execution failed: \" . $e->getMessage());\n                    $invoiceBatch = \\App\\Models\\InvoiceBatch::find($batchId);\n                    if ($invoiceBatch) {\n                        $invoiceBatch->update([\n                            \'status\' => \'failed\',\n                        ]);\n                    }\n                    \\Illuminate\\Support\\Facades\\Storage::disk(\'public\')->delete($tempFile);\n                }\";s:5:\"scope\";s:31:\"App\\Jobs\\ProcessInvoiceBatchJob\";s:4:\"this\";N;s:4:\"self\";s:32:\"00000000000006560000000000000000\";}\";s:4:\"hash\";s:44:\"d2lXX16jUrflWfiU+W+ThUP4I+Lpx6IFX/lzbEzOoC4=\";}}}}',NULL,1782037644,1782037645),('a22fc8b6-aaa2-456a-9fbc-2fde1440a1dc','Rosys Bulk PDF: #BATCH-20260705141903-7103',3,0,0,'[]','a:2:{s:4:\"then\";a:1:{i:0;O:47:\"Laravel\\SerializableClosure\\SerializableClosure\":1:{s:12:\"serializable\";O:46:\"Laravel\\SerializableClosure\\Serializers\\Signed\":2:{s:12:\"serializable\";s:863:\"O:46:\"Laravel\\SerializableClosure\\Serializers\\Native\":5:{s:3:\"use\";a:2:{s:7:\"batchId\";i:5;s:8:\"tempFile\";s:58:\"temp_imports/r3eyQXCcXkTLTYJ3R13yD1aPuVdfoqqP81w9it6W.xlsx\";}s:8:\"function\";s:551:\"function (\\Illuminate\\Bus\\Batch $busBatch) use ($batchId, $tempFile) {\n                    $invoiceBatch = \\App\\Models\\InvoiceBatch::find($batchId);\n                    if ($invoiceBatch) {\n                        // All individual PDFs are complete, trigger merging and zipping\n                        dispatch(new \\App\\Jobs\\FinalizeInvoiceBatchJob($invoiceBatch));\n                    }\n                    // Clean up temporary excel file\n                    \\Illuminate\\Support\\Facades\\Storage::disk(\'public\')->delete($tempFile);\n                }\";s:5:\"scope\";s:31:\"App\\Jobs\\ProcessInvoiceBatchJob\";s:4:\"this\";N;s:4:\"self\";s:32:\"00000000000006660000000000000000\";}\";s:4:\"hash\";s:44:\"IylmPen12v8JYHj/8igBkiyTVJUbtBIjd9ZeYYHP2bc=\";}}}s:5:\"catch\";a:1:{i:0;O:47:\"Laravel\\SerializableClosure\\SerializableClosure\":1:{s:12:\"serializable\";O:46:\"Laravel\\SerializableClosure\\Serializers\\Signed\":2:{s:12:\"serializable\";s:894:\"O:46:\"Laravel\\SerializableClosure\\Serializers\\Native\":5:{s:3:\"use\";a:2:{s:7:\"batchId\";i:5;s:8:\"tempFile\";s:58:\"temp_imports/r3eyQXCcXkTLTYJ3R13yD1aPuVdfoqqP81w9it6W.xlsx\";}s:8:\"function\";s:582:\"function (\\Illuminate\\Bus\\Batch $busBatch, \\Throwable $e) use ($batchId, $tempFile) {\n                    \\Illuminate\\Support\\Facades\\Log::error(\"Bulk PDF job batch execution failed: \" . $e->getMessage());\n                    $invoiceBatch = \\App\\Models\\InvoiceBatch::find($batchId);\n                    if ($invoiceBatch) {\n                        $invoiceBatch->update([\n                            \'status\' => \'failed\',\n                        ]);\n                    }\n                    \\Illuminate\\Support\\Facades\\Storage::disk(\'public\')->delete($tempFile);\n                }\";s:5:\"scope\";s:31:\"App\\Jobs\\ProcessInvoiceBatchJob\";s:4:\"this\";N;s:4:\"self\";s:32:\"00000000000005960000000000000000\";}\";s:4:\"hash\";s:44:\"1B9d4c5zwo9Z3yavqP8+By6rqbuLJ6uXTb6Xq1v0d4g=\";}}}}',NULL,1783261145,1783261146),('a22fc921-e315-4cdc-859a-14acba16cadf','Rosys Bulk PDF: #BATCH-20260705142015-5231',3,0,0,'[]','a:2:{s:4:\"then\";a:1:{i:0;O:47:\"Laravel\\SerializableClosure\\SerializableClosure\":1:{s:12:\"serializable\";O:46:\"Laravel\\SerializableClosure\\Serializers\\Signed\":2:{s:12:\"serializable\";s:863:\"O:46:\"Laravel\\SerializableClosure\\Serializers\\Native\":5:{s:3:\"use\";a:2:{s:7:\"batchId\";i:6;s:8:\"tempFile\";s:58:\"temp_imports/4QWwgk2aCh9BEXsj7x8V3aav6JO4yRCg7aVcj59A.xlsx\";}s:8:\"function\";s:551:\"function (\\Illuminate\\Bus\\Batch $busBatch) use ($batchId, $tempFile) {\n                    $invoiceBatch = \\App\\Models\\InvoiceBatch::find($batchId);\n                    if ($invoiceBatch) {\n                        // All individual PDFs are complete, trigger merging and zipping\n                        dispatch(new \\App\\Jobs\\FinalizeInvoiceBatchJob($invoiceBatch));\n                    }\n                    // Clean up temporary excel file\n                    \\Illuminate\\Support\\Facades\\Storage::disk(\'public\')->delete($tempFile);\n                }\";s:5:\"scope\";s:31:\"App\\Jobs\\ProcessInvoiceBatchJob\";s:4:\"this\";N;s:4:\"self\";s:32:\"00000000000010b70000000000000000\";}\";s:4:\"hash\";s:44:\"DaYY0gsIdC6ECGYJb3Zbmxd9xjSmvGECIDJvmeacw64=\";}}}s:5:\"catch\";a:1:{i:0;O:47:\"Laravel\\SerializableClosure\\SerializableClosure\":1:{s:12:\"serializable\";O:46:\"Laravel\\SerializableClosure\\Serializers\\Signed\":2:{s:12:\"serializable\";s:894:\"O:46:\"Laravel\\SerializableClosure\\Serializers\\Native\":5:{s:3:\"use\";a:2:{s:7:\"batchId\";i:6;s:8:\"tempFile\";s:58:\"temp_imports/4QWwgk2aCh9BEXsj7x8V3aav6JO4yRCg7aVcj59A.xlsx\";}s:8:\"function\";s:582:\"function (\\Illuminate\\Bus\\Batch $busBatch, \\Throwable $e) use ($batchId, $tempFile) {\n                    \\Illuminate\\Support\\Facades\\Log::error(\"Bulk PDF job batch execution failed: \" . $e->getMessage());\n                    $invoiceBatch = \\App\\Models\\InvoiceBatch::find($batchId);\n                    if ($invoiceBatch) {\n                        $invoiceBatch->update([\n                            \'status\' => \'failed\',\n                        ]);\n                    }\n                    \\Illuminate\\Support\\Facades\\Storage::disk(\'public\')->delete($tempFile);\n                }\";s:5:\"scope\";s:31:\"App\\Jobs\\ProcessInvoiceBatchJob\";s:4:\"this\";N;s:4:\"self\";s:32:\"0000000000000ff70000000000000000\";}\";s:4:\"hash\";s:44:\"sZw9/IItgZgN+2hBNKTV0eKiWeFX4+h23m04rlkRrVo=\";}}}}',NULL,1783261216,1783261216),('a22fcb17-fc9f-452b-9c1e-9904c2c83160','Rosys Bulk PDF: #BATCH-20260705142543-9137',3,0,0,'[]','a:2:{s:4:\"then\";a:1:{i:0;O:47:\"Laravel\\SerializableClosure\\SerializableClosure\":1:{s:12:\"serializable\";O:46:\"Laravel\\SerializableClosure\\Serializers\\Signed\":2:{s:12:\"serializable\";s:863:\"O:46:\"Laravel\\SerializableClosure\\Serializers\\Native\":5:{s:3:\"use\";a:2:{s:7:\"batchId\";i:7;s:8:\"tempFile\";s:58:\"temp_imports/Mq0WQfHeQFjLevROqyDDdPuaPc1wJXPASB4Pmez0.xlsx\";}s:8:\"function\";s:551:\"function (\\Illuminate\\Bus\\Batch $busBatch) use ($batchId, $tempFile) {\n                    $invoiceBatch = \\App\\Models\\InvoiceBatch::find($batchId);\n                    if ($invoiceBatch) {\n                        // All individual PDFs are complete, trigger merging and zipping\n                        dispatch(new \\App\\Jobs\\FinalizeInvoiceBatchJob($invoiceBatch));\n                    }\n                    // Clean up temporary excel file\n                    \\Illuminate\\Support\\Facades\\Storage::disk(\'public\')->delete($tempFile);\n                }\";s:5:\"scope\";s:31:\"App\\Jobs\\ProcessInvoiceBatchJob\";s:4:\"this\";N;s:4:\"self\";s:32:\"00000000000006640000000000000000\";}\";s:4:\"hash\";s:44:\"frOori4uvOmOy+DkWs/Vs4STRnd4Nn3nll7CXWtEYow=\";}}}s:5:\"catch\";a:1:{i:0;O:47:\"Laravel\\SerializableClosure\\SerializableClosure\":1:{s:12:\"serializable\";O:46:\"Laravel\\SerializableClosure\\Serializers\\Signed\":2:{s:12:\"serializable\";s:894:\"O:46:\"Laravel\\SerializableClosure\\Serializers\\Native\":5:{s:3:\"use\";a:2:{s:7:\"batchId\";i:7;s:8:\"tempFile\";s:58:\"temp_imports/Mq0WQfHeQFjLevROqyDDdPuaPc1wJXPASB4Pmez0.xlsx\";}s:8:\"function\";s:582:\"function (\\Illuminate\\Bus\\Batch $busBatch, \\Throwable $e) use ($batchId, $tempFile) {\n                    \\Illuminate\\Support\\Facades\\Log::error(\"Bulk PDF job batch execution failed: \" . $e->getMessage());\n                    $invoiceBatch = \\App\\Models\\InvoiceBatch::find($batchId);\n                    if ($invoiceBatch) {\n                        $invoiceBatch->update([\n                            \'status\' => \'failed\',\n                        ]);\n                    }\n                    \\Illuminate\\Support\\Facades\\Storage::disk(\'public\')->delete($tempFile);\n                }\";s:5:\"scope\";s:31:\"App\\Jobs\\ProcessInvoiceBatchJob\";s:4:\"this\";N;s:4:\"self\";s:32:\"00000000000007ff0000000000000000\";}\";s:4:\"hash\";s:44:\"Y49toUIhpEPoHTiIwnjp3nZJ7X0weogtqUBa85qEYTg=\";}}}}',NULL,1783261545,1783261545),('a22fcb4b-c690-436f-92b8-3edf8c4f2349','Rosys Bulk PDF: #BATCH-20260705142617-7822',3,0,0,'[]','a:2:{s:4:\"then\";a:1:{i:0;O:47:\"Laravel\\SerializableClosure\\SerializableClosure\":1:{s:12:\"serializable\";O:46:\"Laravel\\SerializableClosure\\Serializers\\Signed\":2:{s:12:\"serializable\";s:863:\"O:46:\"Laravel\\SerializableClosure\\Serializers\\Native\":5:{s:3:\"use\";a:2:{s:7:\"batchId\";i:8;s:8:\"tempFile\";s:58:\"temp_imports/EdtQsU2Jta1fi7NsmbZS8PHcgty9VPTU74Zm9zCT.xlsx\";}s:8:\"function\";s:551:\"function (\\Illuminate\\Bus\\Batch $busBatch) use ($batchId, $tempFile) {\n                    $invoiceBatch = \\App\\Models\\InvoiceBatch::find($batchId);\n                    if ($invoiceBatch) {\n                        // All individual PDFs are complete, trigger merging and zipping\n                        dispatch(new \\App\\Jobs\\FinalizeInvoiceBatchJob($invoiceBatch));\n                    }\n                    // Clean up temporary excel file\n                    \\Illuminate\\Support\\Facades\\Storage::disk(\'public\')->delete($tempFile);\n                }\";s:5:\"scope\";s:31:\"App\\Jobs\\ProcessInvoiceBatchJob\";s:4:\"this\";N;s:4:\"self\";s:32:\"0000000000000fca0000000000000000\";}\";s:4:\"hash\";s:44:\"SMxTMboC+4y7nKGEgLj1OHIEv1jWeua6FUi00LYg+Lw=\";}}}s:5:\"catch\";a:1:{i:0;O:47:\"Laravel\\SerializableClosure\\SerializableClosure\":1:{s:12:\"serializable\";O:46:\"Laravel\\SerializableClosure\\Serializers\\Signed\":2:{s:12:\"serializable\";s:894:\"O:46:\"Laravel\\SerializableClosure\\Serializers\\Native\":5:{s:3:\"use\";a:2:{s:7:\"batchId\";i:8;s:8:\"tempFile\";s:58:\"temp_imports/EdtQsU2Jta1fi7NsmbZS8PHcgty9VPTU74Zm9zCT.xlsx\";}s:8:\"function\";s:582:\"function (\\Illuminate\\Bus\\Batch $busBatch, \\Throwable $e) use ($batchId, $tempFile) {\n                    \\Illuminate\\Support\\Facades\\Log::error(\"Bulk PDF job batch execution failed: \" . $e->getMessage());\n                    $invoiceBatch = \\App\\Models\\InvoiceBatch::find($batchId);\n                    if ($invoiceBatch) {\n                        $invoiceBatch->update([\n                            \'status\' => \'failed\',\n                        ]);\n                    }\n                    \\Illuminate\\Support\\Facades\\Storage::disk(\'public\')->delete($tempFile);\n                }\";s:5:\"scope\";s:31:\"App\\Jobs\\ProcessInvoiceBatchJob\";s:4:\"this\";N;s:4:\"self\";s:32:\"0000000000000fd50000000000000000\";}\";s:4:\"hash\";s:44:\"lnIW+9CF2INybTtVx1gCBW6LbdLvGZkR1pwDqlold1o=\";}}}}',NULL,1783261579,1783261579);
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (12,'0001_01_01_000000_create_users_table',1),(13,'0001_01_01_000001_create_cache_table',1),(14,'0001_01_01_000002_create_jobs_table',1),(15,'2026_06_21_000001_create_plans_table',1),(16,'2026_06_21_000002_create_subscriptions_table',1),(17,'2026_06_21_000003_create_companies_table',1),(18,'2026_06_21_000004_create_company_assets_table',1),(19,'2026_06_21_000005_create_invoice_batches_table',1),(20,'2026_06_21_000006_create_invoices_table',1),(21,'2026_06_21_000007_create_invoice_items_table',1),(22,'2026_06_21_000008_create_activity_logs_table',1),(23,'2026_06_21_102140_create_personal_access_tokens_table',2),(24,'2026_07_05_100352_add_bank_and_signer_fields_to_companies_table',3),(25,'2026_07_05_141539_add_company_and_gst_to_invoice_batches',4),(26,'2026_07_05_151717_add_logo_and_panel_name_to_vendors_table',5);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',2,'auth_token','f814280a1987d275954e6ad2c788c3c5cdd62c78962bf9cc3cd681a69d8e6106','[\"*\"]','2026-06-21 05:01:47',NULL,'2026-06-21 04:52:20','2026-06-21 05:01:47'),(9,'App\\Models\\User',2,'auth_token','0529f84071acad943e28f128fb1024fb451537bb0b3e8cb301a824ced3d05ec0','[\"*\"]','2026-07-05 10:01:56',NULL,'2026-07-05 10:01:15','2026-07-05 10:01:56');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(8,2) NOT NULL,
  `invoice_limit` int NOT NULL DEFAULT '-1',
  `company_limit` int NOT NULL DEFAULT '-1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
INSERT INTO `plans` VALUES (1,'Free Trial','Perfect for testing out Rosys Billing. Max 100 invoices/month.',0.00,100,1,'2026-06-21 03:58:31','2026-06-21 03:58:31'),(2,'Premium Professional','Ideal for small-to-medium businesses. Max 5000 invoices/month.',49.00,5000,5,'2026-06-21 03:58:31','2026-06-21 03:58:31'),(3,'Enterprise Unlimited','For large organizations. Unlimited invoices and companies.',199.00,-1,-1,'2026-06-21 03:58:31','2026-06-21 03:58:31');
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('2oKyABv587QkIspBW4n9Ruzr74huXAzqatP75iqx',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36','eyJfdG9rZW4iOiJtazAxMHdabkVMbmphdjNpeHlPQ1VhR283Z0VEd1V1S1FxVWl2UnNxIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19',1782036582),('Kx7gHai8UKx7z0P7s5Eg4cZhTXv4aGS5bvJBJNID',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36','eyJfdG9rZW4iOiJiVVlhVWFORWJQRkE0TUJxWUZHZjFjRVl3c0VrNWJLcE83WWVlamNIIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cL2xvY2FsaG9zdDo4MDAwXC9zYW5jdHVtXC9jc3JmLWNvb2tpZSIsInJvdXRlIjoic2FuY3R1bS5jc3JmLWNvb2tpZSJ9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19',1782037151);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `vendor_id` bigint unsigned NOT NULL,
  `plan_id` bigint unsigned NOT NULL,
  `starts_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subscriptions_vendor_id_foreign` (`vendor_id`),
  KEY `subscriptions_plan_id_foreign` (`plan_id`),
  CONSTRAINT `subscriptions_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `subscriptions_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
INSERT INTO `subscriptions` VALUES (1,1,3,'2026-06-21 03:58:31','2027-06-21 03:58:31','active','2026-06-21 03:58:31','2026-06-21 03:58:31'),(2,2,2,'2026-06-21 03:58:31','2026-07-21 03:58:31','active','2026-06-21 03:58:31','2026-06-21 03:58:31');
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `vendor_id` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('super_admin','vendor_admin','staff','viewer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'viewer',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_vendor_id_foreign` (`vendor_id`),
  CONSTRAINT `users_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'Super Administrator','superadmin@rosys.com',NULL,'$2y$12$VgOx5DuX36AEa9pZj/iFB.B/TuWmpIrzOMtnFdjpGfBCXM8CDIz/.','super_admin',1,NULL,'2026-06-21 03:58:31','2026-06-21 03:58:31'),(2,1,'Rosys Admin User','admin@rosys.com',NULL,'$2y$12$.9Bw8GbqBygiYNEwZ1anaO0BusvR4m1UKxLCYL8YyG.sOor37sx4i','vendor_admin',1,NULL,'2026-06-21 03:58:31','2026-06-21 03:58:31'),(3,1,'Rosys Staff Operator','staff@rosys.com',NULL,'$2y$12$.ead8NvLIBLFw2QwhJ7qV.tj1Cyf2h/U0.QhR0beF5aG618b91Gj6','staff',1,NULL,'2026-06-21 03:58:32','2026-06-21 03:58:32'),(4,1,'Rosys Viewer Guest','viewer@rosys.com',NULL,'$2y$12$cyRGpr9bH6m2RGI2dpxnGem9IxwHpMk7Gx44dQVJATm2wV5yldKV6','viewer',1,NULL,'2026-06-21 03:58:32','2026-06-21 03:58:32'),(5,2,'Attire Admin Manager','admin@attire.com',NULL,'$2y$12$j/eOwzEo1wbtsDvkyLWPfedW90Tvpf0b4cG8wvNM7zgL3L2Dgd4Ai','vendor_admin',1,NULL,'2026-06-21 03:58:32','2026-06-21 03:58:32');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendors` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `panel_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendors`
--

LOCK TABLES `vendors` WRITE;
/*!40000 ALTER TABLE `vendors` DISABLE KEYS */;
INSERT INTO `vendors` VALUES (1,'Rosys Technologies Group','branding/oSLywfByIHYaVLEAIScvrtBBjAL6vokJCvwg7EqH.png','Rosys Billing Systm',1,'2026-06-21 03:58:31','2026-07-05 09:54:30'),(2,'Attire Apparel Brands',NULL,NULL,1,'2026-06-21 03:58:31','2026-06-21 03:58:31'),(3,'Legacy Inactive Corp',NULL,NULL,0,'2026-06-21 03:58:31','2026-06-21 03:58:31');
/*!40000 ALTER TABLE `vendors` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-05 21:03:00
