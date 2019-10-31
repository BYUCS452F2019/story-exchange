USE story_exchange;

INSERT INTO Users (UserID, UserName, Password, Credit) values (1000, "notch", "password", 562);
INSERT INTO Users (UserID, UserName, Password, Credit) values (1001, "dipper", "password", 26);
INSERT INTO Users (UserID, UserName, Password, Credit) values (1002, "bettyTheBot", "password", 99);
INSERT INTO Users (UserID, UserName, Password, Credit) values (1003, "sparrow", "password", 350);
INSERT INTO Users (UserID, UserName, Password, Credit) values (1004, "mistborn", "password", 0);
INSERT INTO Users (UserID, UserName, Password, Credit) values (1005, "falcon", "password", 19);
INSERT INTO Users (UserID, UserName, Password, Credit) values (1006, "basic provo bro", "password", 36);
INSERT INTO Users (UserID, UserName, Password, Credit) values (1007, "demo_user", "asdf", 106);

INSERT INTO Stories (StoryID, WriterID, StoryURL, Title, Genre, Blurb, WordCount, DesiredReviews)
    values (1000, 1007, "inkitt.com/fake-link", "Those Ills We Bear", "Romance", "This is a book I put a lot of time into", 50000, 10);

INSERT INTO Stories (StoryID, WriterID, StoryURL, Title, Genre, Blurb, WordCount, DesiredReviews)
    values (1001, 1005, "inkitt.com/fake-link", "What We Really Are", "Fantasy", "This was based on a real dream I had in real life.", 90000, 10);

INSERT INTO Stories (StoryID, WriterID, StoryURL, Title, Genre, Blurb, WordCount, DesiredReviews)
    values (1002, 1004, "inkitt.com/fake-link", "Birds Aren't Real", "Drama", "They were created by the CIA to spy on us", 200000, 50);

INSERT INTO Stories (StoryID, WriterID, StoryURL, Title, Genre, Blurb, WordCount, DesiredReviews)
    values (1003, 1007, "inkitt.com/fake-link", "Going in Circles", "Drama", "I'm more of a triangle guy myself.", 20000, 5);

INSERT INTO Stories (StoryID, WriterID, StoryURL, Title, Genre, Blurb, WordCount, DesiredReviews)
    values (1004, 1003, "inkitt.com/fake-link", "Uncovered", "Fantasy", "Super hero novel in a futuristic society", 90000, 7);

INSERT INTO Stories (StoryID, WriterID, StoryURL, Title, Genre, Blurb, WordCount, DesiredReviews)
    values (1005, 1003, "inkitt.com/fake-link", "No Bodies", "Horror", "A horror/adventure/thriller/romance. This book has everything.", 60000, 6);

INSERT INTO Stories (StoryID, WriterID, StoryURL, Title, Genre, Blurb, WordCount, DesiredReviews)
    values (1006, 1002, "inkitt.com/fake-link", "Modestly Mean", "Fan-Fiction", "My self-insert LOTR dreams come true <3", 20000, 1);


INSERT INTO Reviews (ReviewText, ReviewerID, StoryID) 
    values ("This was not the best book I've ever read, but it also wasn't the worst.", 1005, 1000);

INSERT INTO Reviews (ReviewText, ReviewerID, StoryID) 
    values ("I actually really enjoyed reading this! It made me think about my mom.", 1002, 1000);

INSERT INTO Reviews (ReviewText, ReviewerID, StoryID) 
    values ("Absolute garbage. Start over.", 1003, 1003);

INSERT INTO Reviews (ReviewText, ReviewerID, StoryID) 
    values ("I have mixed feelings about this. On the one hand.... but then again, on the other...", 1001, 1003);

INSERT INTO Reviews (ReviewText, ReviewerID, StoryID) 
    values ("This was a great story! I really liked your characters. I felt like I could never predict what Jessica would do, but I actually kind of loved that about her character. I thought the plot was pretty good, but the first quarter was a little slow for me. Chapters 4 and 5 felt like they could be combined, for example, and I don't see why chapter 7 is there at all. The biggest weakness though was with setting - I never felt like I had a good idea of where the characters were. Take some time to describe the buildings, the weather, the yellow wallpaper, whatever it takes to give me some hints and let my imagination do the rest.", 1007, 1002);

INSERT INTO Reviews (ReviewText, ReviewerID, StoryID) 
    values ("Overall this was pretty solid. I like the way the characters interacted with each other and how you had a few that were constant but most of them fell in and out of the story. It made it seem more realistic. I also liked you pacing, although at some points it felt like you were stretching to hit a specific word count. If you want to improve, I would say my biggest issue was with prose. Tighten it up a little more and try to find your own voice, then keep that voice consistent throughout the story. Also, don't try to use big words if you don't know what they mean.", 1007, 1005);


INSERT INTO Reservations (UserID, StoryID) values (1007, 1006);
