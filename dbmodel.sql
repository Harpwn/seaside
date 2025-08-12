CREATE TABLE IF NOT EXISTS `token` (
  `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `card_type` varchar(16) NOT NULL, -- 1
  `card_type_arg` int(11) NOT NULL, -- 1
  `card_location` varchar(25) NOT NULL, -- Bag, Sea or [player_id]
  `card_location_arg` int(11) NOT NULL, -- Pile identifier
  `side1` varchar(16) NOT NULL,
  `side2` varchar(16) NOT NULL,
  `flipped` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;