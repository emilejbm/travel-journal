const User = require('../models/user')
const jwt = require('jsonwebtoken')

// handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code)
    let errors = { email: '', password: '' }

    // incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'That email is not registered'
    }

    // incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'That password is incorrect'
    }

    // duplicate username/email error
    if (err.code === 11000) {
        errors.email = 'that email or username is already registered'
        return errors
    }

    // validation errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message
        })
    }

    return errors
}

// create json web token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1hr' })
};

// controller routes
module.exports.index = (req, res) => {
    res.render('index')
}

module.exports.login_get = (req, res) => {
    res.render('login')
}

module.exports.register_get = (req, res) => {
    res.render('register')
}

module.exports.login_post = async (req, res) => {
    const { username_or_email, password } = req.body

    try {
        const user = await User.login(username_or_email, password)
        const token = createToken(user._id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: 60*60 })
        res.status(200)

        // render home page for user
        res.render('login_cond', {
            message: 'Login successful',
            alert_status: 'alert alert-success'
        })
    } catch (err) {
        const errors = handleErrors(err)
        res.status(400)
        res.render('login_cond', {
            message: 'Invalid login credentials',
            alert_status: 'alert alert-danger'
        })
    }
}

module.exports.register_post = async (req, res) => {
    const { name, username, email, password } = req.body

    try {
        const user = await User.create({ name, username, email, password })
        const token = createToken(user._id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: 60*60 })
        res.status(201)
        
        // change to redirect to user home
        res.render('register_cond', {
            message: "User registered!",
            alert_status: 'alert alert-success'
        })
    } catch(err) {
        const errors = handleErrors(err)
        res.status(400)
        res.render('register_cond', {
            message: 'Error registering user. Email may already be in use',
            alert_status: 'alert alert-danger'
        })
    }
}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 })
    res.redirect('/index')
}