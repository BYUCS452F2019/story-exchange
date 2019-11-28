CREATE DATABASE IF NOT EXISTS story_exchange;
USE story_exchange;
/* 
You only need to run the USER statements once.
I got the instructions from http://www.daniloaz.com/en/how-to-create-a-user-in-mysql-mariadb-and-grant-permissions-on-a-specific-database/
*/
/*
CREATE USER 'db_admin' IDENTIFIED BY 'fake42';
GRANT USAGE ON *.* TO 'db_admin'@localhost IDENTIFIED BY 'fake42';
GRANT ALL PRIVILEGES ON `story_exchange`.* TO 'db_admin'@'localhost;'
FLUSH PRIVILEGES;
*/
CREATE TABLE Users (
  UserID int PRIMARY KEY AUTO_INCREMENT,
  UserName text NOT NULL,
  Password text NOT NULL,
  Credit int NOT NULL
);
CREATE TABLE LoginSessions (
  SessionToken varchar(16) PRIMARY KEY,
  UserID int,
  Expires Datetime,
  FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
CREATE TABLE Stories (
  StoryID int PRIMARY KEY AUTO_INCREMENT,
  WriterID int NOT NULL,
  StoryURL text NOT NULL,
  PostedDate timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Title text NOT NULL,
  Genre text NOT NULL,
  Blurb text NOT NULL,
  WordCount int NOT NULL,
  DesiredReviews int NOT NULL,
  FOREIGN KEY (WriterID) REFERENCES Users(UserID)
);
CREATE TABLE Reviews (
  ReviewID int PRIMARY KEY AUTO_INCREMENT,
  ReviewText text NOT NULL,
  ReviewerID int NOT NULL,
  StoryID int NOT NULL,
  Stars decimal(2, 1),
  FOREIGN KEY (ReviewerID) REFERENCES Users(UserID),
  FOREIGN KEY (StoryID) REFERENCES Stories(StoryID)
);
CREATE TABLE Reservations (
  UserID int NOT NULL,
  StoryID int NOT NULL,
  CONSTRAINT reservations_pk PRIMARY KEY (UserID, StoryID),
  FOREIGN KEY (UserID) REFERENCES Users(UserID),
  FOREIGN KEY (StoryID) REFERENCES Stories(StoryID)
);