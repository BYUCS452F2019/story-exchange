
#!/bin/bashi

sudo mysql -u root <<MYSQL_SCRIPT
CREATE DATABASE story_exchange;
MYSQL_SCRIPT

echo "MariaDB database created: story_exchange"
