/*
Allow login and registering a user
Connect to database and display users' journal / photos
*/

const path = require("path")
const dotenv = require('dotenv')
const connection = require('./db')
const express = require('express')
const cookieParser = require('cookie-parser')
const authRoutes = require("./routes/authRoutes")
const { requireAuth, checkUser } = require('./middleware/authMiddleware')


const app = express()
app.set('view engine', 'ejs')
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: 'false'}))
app.use(express.static(path.join(__dirname, '/views')))
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')))
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')))

dotenv.config({ path: './.env'})

// connect to mongoDB server
connection()
app.listen(process.env.PORT, ()=> {
    console.log("server started on port 5002")
})

// routes
app.get('*', checkUser)
app.get('/', (req, res) => res.render('index'))
app.use(authRoutes)