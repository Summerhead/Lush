SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM `lush`.`image` WHERE (`id` = '1476') and (`blob_id` = '1476');
DELETE FROM `lush`.`image_artist` WHERE (`image_id` = '1476') and (`artist_id` = '2743');
DELETE FROM `lush`.`image_blob` WHERE (`id` = '1476');
DELETE FROM `lush`.`image` WHERE (`id` = '1475') and (`blob_id` = '1475');
DELETE FROM `lush`.`image_artist` WHERE (`image_id` = '1475') and (`artist_id` = '496');
DELETE FROM `lush`.`image_blob` WHERE (`id` = '1475');
ALTER TABLE image AUTO_INCREMENT = 1475;
ALTER TABLE image_blob AUTO_INCREMENT = 1475;

SET FOREIGN_KEY_CHECKS = 1;
