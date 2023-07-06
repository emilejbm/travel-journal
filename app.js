/*
Allow login and registering a user
Connect to database and display users' journal / photos
*/

const express = require('express')
const mysql = require("mysql")
const dotenv = require('dotenv')
const path = require("path")
const bcrypt = require("bcryptjs")

const app = express()

app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: 'false'}))
app.use(express.json())
app.use(express.static(path.join(__dirname, '/views')))
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')))
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')))

dotenv.config({ path: './.env'})

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

db.connect((error) => {
    if(error) {
        console.log(error)
    } else {
        console.log("MySQL connected")
    }
})

async function comparePassword(plaintextPassword, hash) {
    const result = await bcrypt.compare(plaintextPassword, hash);
    return result;
}

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/login", async (req, res) => {
    res.render("login")
})

app.get("/register", (req, res) => {
    res.render("register")
}) 

app.post("/login", async (req,res) => {
    // login via username or email
    const {username_or_email, password} = req.body
    db.query('SELECT * FROM users WHERE email = ?', [username_or_email], async (err, response) => {
        if (err) {
            console.log(err)
        }
        if (response.length > 0) {
            console.log('found email')
            // validate password
            bcrypt.compare(password, response[0].password, (err, data) => {
                if (err) throw err
                if (data) {
                    return res.render("index")
                } else {
                    return res.render('login_cond', {
                            message: 'Incorrect password',
                            alert_status: 'alert alert-danger'
                        })
                }
            })
        } else {
            db.query('SELECT * FROM users WHERE username = ?', [username_or_email], async (err, response) => {
            if (err) {
                console.log(err)
            }
            if (response.length > 0) {
                console.log('found username')
                // validate password
                bcrypt.compare(password, response[0].password, (err, data) => {
                    if (err) throw err
                    if (data) {
                        return res.render("index")
                    } else {
                        return res.render('login_cond', {
                                message: 'Incorrect password',
                                alert_status: 'alert alert-danger'
                            })
                    }
                })
            } else {
                console.log("nor username nor email is valid")
            }})
        }
    })

    // if (1) {
    //     const refreshToken = generateRefreshToken ({user: req.body.name}).res.json ({accessToken: accessToken, refreshToken: refreshToken});
    // } else {
    //     res.status(401).send("Password Incorrect!")
    // }
})


// allow login with username or email
// verify unique username and email
app.post("/register", (req, res) => {
    const {name, username, email, password, password_confirm} = req.body
    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    db.query('SELECT username FROM users WHERE username = ?', [username], async (err, response) => {
        if (err){
            console.log(err)
        }
        if (response.length > 0) {
            return res.render('register_cond', {
                message: 'This username is already in use',
                alert_status: 'alert alert-danger'
            })
        }
    })
    db.query('SELECT email FROM users WHERE email = ?', [email], async (err, response) => {
        if (err){
            console.log(err)
        }
        if (response.length > 0) {
            return res.render('register_cond', {
                message: 'This email is already in use',
                alert_status: 'alert alert-danger'
            })
        } else if (!email.match(validRegex)) {
            return res.render('register_cond', {
                message: 'Invalid email address',
                alert_status: 'alert alert-danger'
            })
        } else if(!(password == password_confirm)) {
            return res.render('register_cond', {
                message: 'Passwords do not match',
                alert_status: 'alert alert-danger'
            })
        }
        let hashedPassword = await bcrypt.hash(password, 8)
        
        db.query('INSERT INTO users SET?', {name: name, username: username, email: email, password: hashedPassword}, (err, response) => {
            if(err) {
                console.log(err)
            } else {
                return res.render('register_cond', {
                    message: 'User registered!',
                    alert_status: 'alert alert-success'
                })
            }
        })
     })
})

// function generateAccessToken(user) {
//     return jwt.sign(user.process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"})
// }

// let refreshTokens = []function 

// accessTokens
// function generateAccessToken(user) {return 
//     jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"}) }// refreshTokens
//     let refreshTokens = []function generateRefreshToken(user) {const refreshToken = 
//     jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "20m"})refreshTokens.push(refreshToken)
//     return refreshToken
//     }

// app.post("/auth/register", async(req, res) => {
//     res.render("register")
// })

app.listen(process.env.PORT, ()=> {
    console.log("server started on port 5002")
})