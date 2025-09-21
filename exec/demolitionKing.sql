-- Demolition King - full bootstrap (create DB + schema + seed)
-- MySQL 8.0+

-- 0) CREATE DATABASE
DROP DATABASE IF EXISTS demolition_king;
CREATE DATABASE demolition_king CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE demolition_king;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- 1) CLEAN DROP (idempotent)
DROP TABLE IF EXISTS user_constructure;
DROP TABLE IF EXISTS playerskin;
DROP TABLE IF EXISTS playerskin_item;
DROP TABLE IF EXISTS report_per_date;
DROP TABLE IF EXISTS report;
DROP TABLE IF EXISTS friend;
DROP TABLE IF EXISTS gold;
DROP TABLE IF EXISTS constructure;
DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS profile;

SET FOREIGN_KEY_CHECKS=1;

-- 2) SCHEMA

-- profile
CREATE TABLE profile (
  profile_seq INT NOT NULL AUTO_INCREMENT,
  image VARCHAR(500),
  PRIMARY KEY (profile_seq),
  UNIQUE KEY profile_seq_UNIQUE (profile_seq)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- user
CREATE TABLE `user` (
  user_uuid VARCHAR(36) NOT NULL DEFAULT (uuid()),
  user_email VARCHAR(50),
  `password` VARCHAR(200),
  user_nickname VARCHAR(50),
  kakao_access_token VARCHAR(500),
  google_access VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  profile_seq INT,
  PRIMARY KEY (user_uuid),
  UNIQUE KEY user_email_UNIQUE (user_email),
  UNIQUE KEY user_nickname_UNIQUE (user_nickname),
  UNIQUE KEY kakao_access_token_UNIQUE (kakao_access_token),
  UNIQUE KEY google_access_UNIQUE (google_access),
  KEY u_profile_seq_idx (profile_seq),
  CONSTRAINT u_profile_seq FOREIGN KEY (profile_seq) REFERENCES profile(profile_seq)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- gold
CREATE TABLE gold (
  gold_seq INT NOT NULL AUTO_INCREMENT,
  user_uuid VARCHAR(36) NOT NULL,
  gold_cnt INT NOT NULL DEFAULT 0 COMMENT '골드 보유량',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (gold_seq),
  UNIQUE KEY uq_gold_user (user_uuid),
  KEY g_user_uuid_idx (user_uuid),
  CONSTRAINT g_user_uuid FOREIGN KEY (user_uuid) REFERENCES `user`(user_uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- friend
CREATE TABLE friend (
  Friend_seq INT NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user_uuid VARCHAR(36) NOT NULL,
  friend_uuid VARCHAR(36) NOT NULL,
  status VARCHAR(10) COMMENT '요청/수락/차단 등',
  PRIMARY KEY (Friend_seq),
  UNIQUE KEY Friend_seq_UNIQUE (Friend_seq),
  KEY f_user_uuid_idx (user_uuid),
  KEY f_friend_uuid_idx (friend_uuid),
  CONSTRAINT f_user_uuid FOREIGN KEY (user_uuid) REFERENCES `user`(user_uuid),
  CONSTRAINT f_friend_uuid FOREIGN KEY (friend_uuid) REFERENCES `user`(user_uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- constructure (파괴 대상)
CREATE TABLE constructure (
  constructure_seq INT NOT NULL AUTO_INCREMENT,
  image_url VARCHAR(1000),
  hp INT NOT NULL,
  rate DECIMAL(19,5) NOT NULL,
  tier VARCHAR(50),
  `name` VARCHAR(50),
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (constructure_seq),
  UNIQUE KEY constructure_seq_UNIQUE (constructure_seq)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- user_constructure (소유/해금 등 매핑)
CREATE TABLE user_constructure (
  user_constructure_seq INT NOT NULL AUTO_INCREMENT,
  user_uuid VARCHAR(36) NOT NULL,
  constructure_seq INT NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_constructure_seq),
  UNIQUE KEY uq_user_constructure (user_uuid, constructure_seq),
  KEY uc_user_idx (user_uuid),
  KEY uc_constructure_idx (constructure_seq),
  CONSTRAINT uc_user_uuid FOREIGN KEY (user_uuid) REFERENCES `user`(user_uuid),
  CONSTRAINT uc_constructure_seq FOREIGN KEY (constructure_seq) REFERENCES constructure(constructure_seq)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- playerskin_item
CREATE TABLE playerskin_item (
  playerskin_item_seq INT NOT NULL AUTO_INCREMENT,
  image VARCHAR(500),
  `name` VARCHAR(45),
  price INT NOT NULL DEFAULT 0,
  PRIMARY KEY (playerskin_item_seq),
  UNIQUE KEY playerskin_item_seq_UNIQUE (playerskin_item_seq)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- playerskin (보유 스킨)
CREATE TABLE playerskin (
  playerskin_seq INT NOT NULL AUTO_INCREMENT,
  is_select INT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user_uuid VARCHAR(36),
  playerskin_item_seq INT,
  is_unlock INT,
  PRIMARY KEY (playerskin_seq),
  UNIQUE KEY playerskin_seq_UNIQUE (playerskin_seq),
  KEY ps_user_uuid_idx (user_uuid),
  KEY ps_item_seq_idx (playerskin_item_seq),
  CONSTRAINT ps_user_uuid FOREIGN KEY (user_uuid) REFERENCES `user`(user_uuid),
  CONSTRAINT ps_item_seq FOREIGN KEY (playerskin_item_seq) REFERENCES playerskin_item(playerskin_item_seq)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- report (누적)
CREATE TABLE report (
  report_seq INT NOT NULL AUTO_INCREMENT,
  single_top_building INT,
  multi_top_building INT,
  play_cnt INT,
  play_time DECIMAL(10,0),
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user_uuid VARCHAR(36),
  gold_medal INT NOT NULL DEFAULT 0,
  silver_medal INT NOT NULL DEFAULT 0,
  bronze_medal INT NOT NULL DEFAULT 0,
  PRIMARY KEY (report_seq),
  UNIQUE KEY report_seq_UNIQUE (report_seq),
  KEY report_user_uuid_idx (user_uuid),
  CONSTRAINT report_user_uuid FOREIGN KEY (user_uuid) REFERENCES `user`(user_uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- report_per_date (일별)
CREATE TABLE report_per_date (
  report_date_seq INT NOT NULL AUTO_INCREMENT,
  user_uuid VARCHAR(36) NOT NULL,
  play_date DATE,
  kcal VARCHAR(8),
  play_time_date DECIMAL(19,5),
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (report_date_seq),
  KEY rpd_user_uuid_idx (user_uuid),
  CONSTRAINT rpd_user_uuid FOREIGN KEY (user_uuid) REFERENCES `user`(user_uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
