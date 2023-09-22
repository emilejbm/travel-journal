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
const createTokens = (_id, username) => {
    const accessToken = jwt.sign({id: _id, username: username}, process.env.JWT_SECRET, { expiresIn: '1hr' });
    const refreshToken = jwt.sign({id: _id, username: username}, process.env.JWT_REFRESH_SECRET, { expiresIn: '1d' });
    return {accessToken, refreshToken};
};

// module.exports.refresh = (req, res) => {
//     const refreshToken = req.cookies['jwt_refresh'];
//     if (!refreshToken) {
//       return res.status(401).send('Access denied. No refresh token provided.');
//     }
//     try {
//         const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
//         const newAccessToken = jwt.sign({ _id: decodedRefreshToken._id, username: decodedRefreshToken.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
//         res.cookie('jwt_access', newAccessToken, { httpOnly: true, maxAge: 60 * 60 * 1000 });

//     } catch (err) {
//         return res.status(400).send('Invalid refresh token.');
//     }
// }

// controller routes
module.exports.index = (req, res) => {
    const token = req.cookies.jwt_access;
    if (token) {
        const username = JSON.parse(atob(token.split('.')[1])).username;
        res.render('index', {
            username: username,
            journalPageCheck: null
        })
    } else {
        res.render('index', {
            username: null,
            journalPageCheck: null
        });
    }
};

module.exports.login_get = (req, res) => {
    res.render('login', {
        username: null,
        message: null,
        alert_status: null,
        journalPageCheck: null
    });
};

module.exports.register_get = (req, res) => {
    res.render('register', {
        username: null,
        message: null,
        alert_status: null,
        journalPageCheck: null
    });
};

module.exports.journals_get = async (req, res) => {
    const token = req.cookies.jwt_access;
    const username = JSON.parse(atob(token.split('.')[1])).username;
    const journals = await Library.getJournals(username);
    res.render('journals', {
        username: username,
        journals: journals,
        journalPageCheck: true
    });
};

// add a journal and return updated journals page
module.exports.journals_post = async (req, res) => {
    const token = req.cookies.jwt_access;
    const username = JSON.parse(atob(token.split('.')[1])).username;
    const url = 'https://localhost:5002/' + username + '/journals'
    await Library.addJournal(req.body.username, req.body.title);
    // i don't think this does anything
    res.writeHead(302, {
        Location: url
    });
    res.end();
};

module.exports.login_post = async (req, res) => {
    const { username_or_email, password } = req.body;
    try {
        const user = await User.login(username_or_email, password);
        const {accessToken, refreshToken} = createTokens(user._id, user.username);
        res.cookie('jwt_access', accessToken, { httpOnly: true, maxAge: 60 * 60 * 1000 }); // 1 hr
        res.cookie('jwt_refresh', refreshToken, { httpOnly: true, maxAge: 60 * 60 * 1000 * 24 }); // 1 d
        res.status(200);
        res.redirect('/');
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400);
        res.render('login', {
            username: null,
            message: 'Invalid login credentials',
            alert_status: 'alert alert-danger',
            journalPageCheck: null
        });
    }
};

module.exports.register_post = async (req, res) => {
    const { name, username, email, password } = req.body;

    try {
        const user = await User.create({ name, username, email, password });
        const {accessToken, refreshToken} = createTokens(user._id, user.username);
        res.cookie('jwt_access', accessToken, { httpOnly: true, maxAge: 60 * 60 * 1000 }); // 1 hr
        res.cookie('jwt_refresh', refreshToken, { httpOnly: true, maxAge: 60 * 60 * 1000 * 24 }); // 1 d
        res.status(201);
        res.render('register', {
            username: username,
            message: "User registered!",
            alert_status: 'alert alert-success',
            journalPageCheck: null
        });
    } catch(err) {
        const errors = handleErrors(err);
        res.status(400);
        res.render('register', {
            username: null,
            message: 'Error registering user. email or username is already be in use',
            alert_status: 'alert alert-danger',
            journalPageCheck: null
        });
    }
};

module.exports.logout_get = (req, res) => {
    res.cookie('jwt_access', '', { maxAge: 1 });
    res.cookie('jwt_refresh', '', { maxAge: 1 });
    res.redirect('/');
};

module.exports.notes_get = (req, res) => {
    const username = req.params.username;
    res.render('notes', {
        username: username,
        journalPageCheck: null
    });
}