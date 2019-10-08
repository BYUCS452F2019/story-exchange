
#!/bin/bashi

sudo mysql -u root <<MYSQL_SCRIPT
USE story_exchange;
CREATE TABLE IF NOT EXISTS User ();
CREATE TABLE IF NOT EXISTS LoginSession ();
CREATE TABLE IF NOT EXISTS Story ();
CREAT TABLE IF NOT EXISTS Review ();
CREATE TABLE IF NOT EXISTS Reservation ();
MYSQL_SCRIPT

echo "MariaDB database created: story_exchange"
