SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM `lush`.`audio` WHERE `id` >= '15143';
DELETE FROM `lush`.`audio_blob` WHERE `id` >= '15143';
DELETE FROM `lush`.`audio_language` WHERE `audio_id` >= '15143';
DELETE FROM `lush`.`audio_artist` WHERE `audio_id` >= '15143';
ALTER TABLE audio AUTO_INCREMENT = 15143;
ALTER TABLE audio_blob AUTO_INCREMENT = 15143;

SET FOREIGN_KEY_CHECKS = 1;
