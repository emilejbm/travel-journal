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
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const User = require('./models/user');


const app = express();
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: 'false'}));
app.use(express.static(path.join(__dirname, '/views')));
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

dotenv.config({ path: './.env'});

// connect to mongoDB server
connection();
app.listen(process.env.PORT, ()=> {
    console.log("server started on port 5000");
});

// routes
app.get('*', checkUser);
app.get('/', async (req, res) => {
    token = req.cookies.jwt;
    if (token) {
        const username = JSON.parse(atob(token.split('.')[1])).username;
        res.render('index', {
            username: username
        })
    } else {
        res.render('index',{
            username: null
        });
    }
});
app.use(authRoutes);