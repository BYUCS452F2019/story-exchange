# Story Exchange

#### Overview
In CS 356, I created the front-end of an app where amateur writers could post their creative writing and get feedback on what they've written. Professor Conrad said that adding a back-end to this app would probably be an acceptable scope for this project. You can view the front-end at <https://bandrus5.github.io/story-exchange/> to get an idea of the functionality the app would support.

#### Details
We would need to add some sort of login method to the front-end and make HTTP requests to the server we build, but other than that the front-end should fit our purposes. Our main task would be to build a server that accepts requests for and executes the proper insertions, deletions, updates, and reads.

###### Team
I think 1-2 other people will be sufficient.

###### SQL
I like MySQL but I'm open to suggestions

###### NoSQL
I was thinking that a graph-based approach would be interesting for this project because we would need to express a many-to-many relationship between pieces of creative writing and users.

###### Business
People earn 'credit' on the Story Exchange site by reviewing other people's stories, then they spend credit to have other people review their work. Once there are enough users, we can make the business profitable by selling 'credit' and by running advertisements on the site.

###### Legal
This would work best as an LLC because we would need some up-front debt to support enough traffic before we could actually start charging for the service or making money by selling 'credit'. An LLC setup would protect us from the burden of that debt if the idea fails.

###### Technical
The prioritized tasks would be:
1. Create a server that accepts HTTP requests
2. Create a SQL database that can store information about user log-in sessions, user's posted stories, and user's story reviews
3. Extend the front-end to user the server and have a log-in screen
4. Re-build the server to use a NoSQL database
