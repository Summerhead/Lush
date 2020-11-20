SET FOREIGN_KEY_CHECKS = 0;

SELECT
    Concat('TRUNCATE TABLE lush.', TABLE_NAME, ';')
FROM
    INFORMATION_SCHEMA.TABLES
WHERE
    table_schema = 'lush';

SET FOREIGN_KEY_CHECKS = 1;
