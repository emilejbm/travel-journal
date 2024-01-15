/*
Allow login and registering a user
Connect to database and display users' journal / photos
*/

const path = require("path");
const dotenv = require('dotenv');
const connection = require('./db');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require("./routes/authRoutes");
const https = require('https');
const fs = require('fs');

const app = express();
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: 'false'}));
app.use('/views', express.static(path.join(__dirname, '/views/')));
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

dotenv.config({ path: './.env'});

// connect to mongoDB server
connection();

const options = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem'),
};

https.createServer(options, app).listen(process.env.PORT, ()=> {
    console.log(`server started on port ${process.env.PORT}`);
});

// routes
app.get('/', async (req, res) => {
    token = req.cookies.jwt_access;
    if (token) {
        const username = JSON.parse(atob(token.split('.')[1])).username;
        res.render('index', {
            username: username,
            journalPageCheck: null
        })
    } else {
        res.render('index',{
            username: null,
            journalPageCheck: null
        });
    }
});
app.use(authRoutes);