### Description
Journaling app meant for travelers. Made with intentions of having cool graphics supporting the journaling done while travelling. 

### Features
- user login
- journaling (local db)
- globe and library graphics

#### Want to add:
- draw marker on places of interest on top of 3d globe
- scan for city names or special locations within journal entries to update graphical pinpoints

#### Drawbacks:
- Journal graphics in library do not detail the title of each journal. Mitigation was to give each journal a randomized tint of color based on its title.
- No backups to the cloud. 
- add journal functionality fails on firefox (Network error, probably cors related issue)

### Requires
- mongodb
- npm and nodejs
- a trusted server certificate (fixes cors related issues)

### Setup
1) install mongodb [tutorial](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/)
2) generate a server certificate (use https on localhost) [tutorial](https://akshitb.medium.com/how-to-run-https-on-localhost-a-step-by-step-guide-c61fde893771)
3) run mongodb
    - brew services start mongodb-community@7.0
    - mongosh
4) fill out .env file
5) npm start


