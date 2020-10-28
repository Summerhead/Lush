SET FOREIGN_KEY_CHECKS = 0;

SELECT
    Concat('TRUNCATE TABLE lush.', TABLE_NAME, ';')
FROM
    INFORMATION_SCHEMA.TABLES
WHERE
    table_schema = 'lush';
    
TRUNCATE TABLE lush.artist;
TRUNCATE TABLE lush.artist_role;
TRUNCATE TABLE lush.artists_in_filename;
TRUNCATE TABLE lush.artists_in_filename_artist;
TRUNCATE TABLE lush.audio;
TRUNCATE TABLE lush.audio_artist;
TRUNCATE TABLE lush.audio_blob;
TRUNCATE TABLE lush.audio_language;
TRUNCATE TABLE lush.filename;
TRUNCATE TABLE lush.image;
TRUNCATE TABLE lush.image_artist;
TRUNCATE TABLE lush.image_blob;
TRUNCATE TABLE lush.language;
TRUNCATE TABLE lush.post_tag;
TRUNCATE TABLE lush.tag;
TRUNCATE TABLE lush.version;

SET FOREIGN_KEY_CHECKS = 1;
