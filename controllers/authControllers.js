//const { nextPowerOfTwo } = require('three/src/math/MathUtils')
const User = require('../models/user');
const { Journal, Library } = require('../models/journal')
const jwt = require('jsonwebtoken');

// handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' };

    // incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'That email is not registered';
    }

    // incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'That password is incorrect';
    }

    // duplicate username/email error
    if (err.code === 11000) {
        errors.email = 'that email or username is already registered';
        return errors;
    }

    // validation errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
};

// create json web token
const createToken = (_id, username) => {
    return jwt.sign(payload={ _id, username }, process.env.JWT_SECRET, { expiresIn: '1hr' });
};

// controller routes
module.exports.index = (req, res) => {
    const token = req.cookies.jwt;
    if (token) {
        const username = JSON.parse(atob(token.split('.')[1])).username;
        res.render('index', {
            username: username
        })
    } else {
        res.render('index', {
            username: null
        });
    }
    
};

module.exports.login_get = (req, res) => {
    res.render('login', {
        username: null,
        message: null,
        alert_status: null
    });
};

module.exports.register_get = (req, res) => {
    res.render('register', {
        username: null,
        message: null,
        alert_status: null
    });
};

module.exports.journals_get = async (req, res) => {
    const token = req.cookies.jwt;
    const username = JSON.parse(atob(token.split('.')[1])).username;
    const journals = await Library.getJournals(username)
    res.render('journals', {
        username: username,
        journals: journals
    });
};

module.exports.journals_post = async (req, res) => {
    const username = req.params.username
    // add a journal
    await Library.addJournal(username);
    const newJournals = await Library.getJournals(username)

    res.render('journals', {
        username: username,
        journals: newJournals
    })
}

module.exports.login_post = async (req, res) => {
    const { username_or_email, password } = req.body;

    try {
        const user = await User.login(username_or_email, password);
        const token = createToken(user._id, user.username);
        res.cookie('jwt', token, { httpOnly: true, maxAge: 60 * 60 * 1000 }); // 1 hour
        res.status(200);
        res.redirect('/')
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400);
        res.render('login', {
            username: null,
            message: 'Invalid login credentials',
            alert_status: 'alert alert-danger'
        });
    }
};

module.exports.register_post = async (req, res) => {
    const { name, username, email, password } = req.body;

    try {
        const user = await User.create({ name, username, email, password });
        const token = createToken(user._id, user.username);
        res.cookie('jwt', token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
        res.status(201);
        
        // change to redirect to user home ?
        res.render('register', {
            username: username,
            message: "User registered!",
            alert_status: 'alert alert-success'
        });
    } catch(err) {
        const errors = handleErrors(err);
        res.status(400);
        res.render('register', {
            username: null,
            message: 'Error registering user. email or username is already be in use',
            alert_status: 'alert alert-danger'
        });
    }
};

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
};