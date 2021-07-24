CREATE DATABASE tank_tactics;
CREATE USER 'game_admin' @'localhost' IDENTIFIED WITH mysql_native_password 'pass';
GRANT ALL PRIVILEGES ON tank_tactics.* TO 'game_admin' @'localhost';
CREATE TABLE player(
  id int NOT NULL primary key AUTO_INCREMENT comment 'primary key',
  create_time DATETIME COMMENT 'create time',
  update_time DATETIME COMMENT 'update time',
  tank_name varchar(255) comment 'name',
  tank_range int comment 'range of tank',
  actions int comment 'number of actions',
  x int comment 'x position',
  y int comment 'y position'
) default charset utf8 comment 'represents a player in a session';