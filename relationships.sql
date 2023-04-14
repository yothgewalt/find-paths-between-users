-- MariaDB dump 10.19  Distrib 10.11.2-MariaDB, for osx10.18 (arm64)
--
-- Host: localhost    Database: s4xajtia9
-- ------------------------------------------------------
-- Server version	10.11.2-MariaDB

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
-- Table structure for table `friend_collection_schema`
--

DROP TABLE IF EXISTS `friend_collection_schema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `friend_collection_schema` (
  `friend_id` int(11) NOT NULL AUTO_INCREMENT,
  `relation_by` int(11) NOT NULL,
  `relation_with` int(11) NOT NULL,
  PRIMARY KEY (`friend_id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friend_collection_schema`
--

LOCK TABLES `friend_collection_schema` WRITE;
/*!40000 ALTER TABLE `friend_collection_schema` DISABLE KEYS */;
INSERT INTO `friend_collection_schema` VALUES
(45,16,17),
(46,17,16),
(47,17,18),
(48,18,17),
(49,18,19),
(50,19,18),
(51,18,16),
(52,16,18);
/*!40000 ALTER TABLE `friend_collection_schema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `friend_request_collection_schema`
--

DROP TABLE IF EXISTS `friend_request_collection_schema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `friend_request_collection_schema` (
  `request_id` int(11) NOT NULL AUTO_INCREMENT,
  `friend_request_by` int(11) NOT NULL,
  `request_to` int(11) NOT NULL,
  PRIMARY KEY (`request_id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friend_request_collection_schema`
--

LOCK TABLES `friend_request_collection_schema` WRITE;
/*!40000 ALTER TABLE `friend_request_collection_schema` DISABLE KEYS */;
/*!40000 ALTER TABLE `friend_request_collection_schema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `member_collection_schema`
--

DROP TABLE IF EXISTS `member_collection_schema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `member_collection_schema` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email_address` varchar(64) NOT NULL,
  `first_name` varchar(64) NOT NULL,
  `last_name` varchar(64) NOT NULL,
  `profile_slug` varchar(32) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_address` (`email_address`),
  UNIQUE KEY `profile_slug` (`profile_slug`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member_collection_schema`
--

LOCK TABLES `member_collection_schema` WRITE;
/*!40000 ALTER TABLE `member_collection_schema` DISABLE KEYS */;
INSERT INTO `member_collection_schema` VALUES
(16,'eine.schlacht@gmail.com','yongyuth','chuankhuntod','fb1c77b9393d','$argon2id$v=19$m=65536,t=3,p=4$pqqx2qRsxb9chYeKsoaAMg$eHLT4ZbXoqPDTk2gRpD+s0rzTyS73gtYET8qZF+Ne6c'),
(17,'roseraksina@gmail.com','rose','raksina','7dc20541c8ef','$argon2id$v=19$m=65536,t=3,p=4$z6V81fbYUiQzvcoIDkYjiQ$SkrJuSZavjifOlc8eWCZ1SWFKPw2l63uPDQWLZ6o+08'),
(18,'naruemon.lily@gmail.com','naruemon','bunsoppon','30b5a00de55d','$argon2id$v=19$m=65536,t=3,p=4$RdVhqLRwYOqCMzumBOmhPw$fGOW94bBUR4A1wl6yLdZ0Y2P4nI1uRlVUAWhXXjIqvI'),
(19,'kitti@xver.cloud','kitti','xver','1eb11be3bdc7','$argon2id$v=19$m=65536,t=3,p=4$nl+yy6nF2eUkVf8isLTl/A$w1GHE50cjGZxHXXKWckB/JNgKIMTQoHIIao1l4SDY8k');
/*!40000 ALTER TABLE `member_collection_schema` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-04-14 22:45:06
