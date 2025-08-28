const express = require('express');
const { authRefreshMiddleware, getUserProfile } = require('../services/aps.js');
const { APS_ACCESS_TOKEN } = require('../config.js');

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
    res.json({
        access_token: APS_ACCESS_TOKEN,
        expires_in: 3600
    });
});

router.get('/api/auth/profile', async function (req, res, next) {
    try {
        const profile = await getUserProfile(APS_ACCESS_TOKEN);
        res.json({ name: `${profile.name}` });
    } catch (err) {
        // If profile fails, return a default user
        res.json({ name: 'Token User' });
    }
});

module.exports = router;
