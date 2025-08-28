const express = require('express');
const { authRefreshMiddleware, getUserProfile } = require('../services/aps.js');

let router = express.Router();

router.get('/api/auth/login', function (req, res) {
    // No login needed with direct token
    res.redirect('/');
});

router.get('/api/auth/logout', function (req, res) {
    // No logout needed with direct token
    res.redirect('/');
});

router.get('/api/auth/token', function (req, res) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    res.json({
        access_token: token,
        expires_in: 3600
    });
});

router.get('/api/auth/profile', async function (req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const profile = await getUserProfile(token);
        res.json({ name: `${profile.name}` });
    } catch (err) {
        console.error('Profile error:', err);
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
