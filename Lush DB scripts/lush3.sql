-- MySQL Script generated by MySQL Workbench
-- Fri Oct 16 22:57:37 2020
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema lush
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema lush
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `lush` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_cs ;
USE `lush` ;

-- -----------------------------------------------------
-- Table `lush`.`image_blob`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lush`.`image_blob` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `image` MEDIUMBLOB NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) INVISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lush`.`image`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lush`.`image` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `blob_id` INT UNSIGNED NOT NULL,
  `deleted` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`, `blob_id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `blob_id_INDEX` (`blob_id` ASC) INVISIBLE,
  UNIQUE INDEX `blob_id_UNIQUE` (`blob_id` ASC) VISIBLE,
  CONSTRAINT `image_blob_id`
    FOREIGN KEY (`blob_id`)
    REFERENCES `lush`.`image_blob` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lush`.`version`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lush`.`version` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  UNIQUE INDEX `content_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lush`.`audio_blob`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lush`.`audio_blob` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `audio` LONGBLOB NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) INVISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lush`.`audio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lush`.`audio` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `blob_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(2048) NULL,
  `lyrics` TEXT NULL,
  `description` TEXT NULL,
  `upload_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`, `blob_id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `version_id_INDEX` (`version_id` ASC) VISIBLE,
  INDEX `blob_id_INDEX` (`blob_id` ASC) VISIBLE,
  UNIQUE INDEX `blob_id_UNIQUE` (`blob_id` ASC) VISIBLE,
  CONSTRAINT `audio_version_id`
    FOREIGN KEY (`version_id`)
    REFERENCES `lush`.`version` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `audio_blob_id`
    FOREIGN KEY (`blob_id`)
    REFERENCES `lush`.`audio_blob` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lush`.`artist`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lush`.`artist` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(510) NOT NULL,
  `description` TEXT NULL,
  `deleted` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lush`.`tag`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lush`.`tag` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `deleted` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lush`.`post_tag`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lush`.`post_tag` (
  `audio_id` INT UNSIGNED NOT NULL,
  `tag_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`audio_id`, `tag_id`),
  INDEX `tag_id_INDEX` (`tag_id` ASC) INVISIBLE,
  CONSTRAINT `post_tag_audio_id`
    FOREIGN KEY (`audio_id`)
    REFERENCES `lush`.`audio` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `post_tag_tag_id`
    FOREIGN KEY (`tag_id`)
    REFERENCES `lush`.`tag` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lush`.`artist_role`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lush`.`artist_role` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lush`.`audio_artist`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lush`.`audio_artist` (
  `audio_id` INT UNSIGNED NOT NULL,
  `artist_id` INT UNSIGNED NOT NULL,
  `artist_role_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `artist_position` INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`audio_id`, `artist_id`),
  INDEX `artist_role_id_INDEX` (`artist_role_id` ASC) INVISIBLE,
  CONSTRAINT `audio_artist_artist_id`
    FOREIGN KEY (`artist_id`)
    REFERENCES `lush`.`artist` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `audio_artist_audio_id`
    FOREIGN KEY (`audio_id`)
    REFERENCES `lush`.`audio` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `audio_artist_artist_role_id`
    FOREIGN KEY (`artist_role_id`)
    REFERENCES `lush`.`artist_role` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lush`.`image_artist`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lush`.`image_artist` (
  `image_id` INT UNSIGNED NOT NULL,
  `artist_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`image_id`, `artist_id`),
  INDEX `artist_id_INDEX` (`artist_id` ASC) VISIBLE,
  CONSTRAINT `image_artist_image_id`
    FOREIGN KEY (`image_id`)
    REFERENCES `lush`.`image` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `image_artist_artist_id`
    FOREIGN KEY (`artist_id`)
    REFERENCES `lush`.`artist` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lush`.`artists_in_filename`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lush`.`artists_in_filename` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `artists` VARCHAR(510) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `artists_UNIQUE` (`artists` ASC) VISIBLE,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lush`.`artists_in_filename_artist`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lush`.`artists_in_filename_artist` (
  `artists_in_filename_id` INT UNSIGNED NOT NULL,
  `artist_id` INT UNSIGNED NOT NULL,
  `artist_role_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `artist_position` INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`artists_in_filename_id`, `artist_id`),
  INDEX `artist_role_id_INDEX` (`artist_role_id` ASC) VISIBLE,
  CONSTRAINT `artists_in_filename_artist_id`
    FOREIGN KEY (`artist_id`)
    REFERENCES `lush`.`artist` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `artists_in_filename_artist_artist_in_filename_id`
    FOREIGN KEY (`artists_in_filename_id`)
    REFERENCES `lush`.`artists_in_filename` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `artists_in_filename_artist_artist_role_id`
    FOREIGN KEY (`artist_role_id`)
    REFERENCES `lush`.`artist_role` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lush`.`filename`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lush`.`filename` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `filename` VARCHAR(510) NOT NULL,
  `renamed_title` VARCHAR(510) NOT NULL,
  `artists_in_filename_id` INT UNSIGNED NOT NULL,
  UNIQUE INDEX `filename_UNIQUE` (`filename` ASC) VISIBLE,
  PRIMARY KEY (`id`),
  INDEX `artists_in_filename_id_INDEX` (`artists_in_filename_id` ASC) VISIBLE,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  CONSTRAINT `filename_artists_in_filename_id`
    FOREIGN KEY (`artists_in_filename_id`)
    REFERENCES `lush`.`artists_in_filename` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lush`.`language`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lush`.`language` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lush`.`audio_language`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lush`.`audio_language` (
  `audio_id` INT UNSIGNED NOT NULL,
  `language_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`audio_id`, `language_id`),
  INDEX `language_id_INDEX` (`language_id` ASC) VISIBLE,
  CONSTRAINT `audio_language_audio_id`
    FOREIGN KEY (`audio_id`)
    REFERENCES `lush`.`audio` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `audio_language_language_id`
    FOREIGN KEY (`language_id`)
    REFERENCES `lush`.`language` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
