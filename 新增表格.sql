-- skill
CREATE TABLE IF NOT EXISTS `u308774430_game`.`skill` (
    `id` INT(5) UNSIGNED NOT NULL AUTO_INCREMENT
    , `name` VARCHAR(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL
    , `type` TINYINT(2) UNSIGNED NOT NULL DEFAULT '0'
    , `type_sub` TINYTEXT NULL
    , `max_lv` TINYINT(2) UNSIGNED NOT NULL DEFAULT '1'
    , `up_list` TINYTEXT NULL
    , `group_f` TINYTEXT NULL
    , `skill_f` TINYTEXT NULL
    , `flag` TINYTEXT NULL
    , `cost` TINYTEXT NULL
    , `effect` TEXT NULL
    , `exp` TINYTEXT NULL
    , `enable` ENUM('N','Y','F','S') NOT NULL DEFAULT 'S'
    , PRIMARY KEY (`id`)
    , INDEX (`type`)
    , UNIQUE (`name`)
) ENGINE = MyISAM CHARSET=utf8 COLLATE utf8_general_ci;