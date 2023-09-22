const jwt = require('jsonwebtoken');
const User = require('../models/user');

// check for valid jwt or refresh token
const requireAuth = (req, res, next) => {
    const accessToken = req.cookies.jwt_access;
    const refreshToken = req.cookies.jwt_refresh;

    if (!accessToken && !refreshToken) {
        return res.status(401).send('Access denied. No tokens provided');
    }

    try {
        const decodedAccessToken = jwt.verify(accessToken, process.env.JWT_SECRET);
        next();
    } catch (err) {
        if (!refreshToken) {
            return res.status(401).send('Access denied. No refresh token provided.');
        }
        try {
            const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const newAccessToken = jwt.sign({_id: decodedRefreshToken._id, username: decodedRefreshToken.username}, process.env.JWT_REFRESH_SECRET, { expiresIn: '1hr' });
            //res.cookie('jwt_access', newAccessToken, { httpOnly: true, sameSite: 'strict' });
            res.cookie('jwt_refresh', refreshToken, { httpOnly: true, maxAge: 60 * 60 * 1000 });
            res.cookie('jwt_access', newAccessToken, { httpOnly: true, maxAge: 60 * 60 * 1000 * 24 });
            next();
        } catch (error) {
            return res.status(400).send('Invalid Token.');
        }
    }
};

// check current user
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
};


module.exports = { requireAuth, checkUser };