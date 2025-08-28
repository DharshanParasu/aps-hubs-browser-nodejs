const express = require('express');
const { getHubs, getProjects, getProjectContents, getItemVersions } = require('../services/aps.js');

let router = express.Router();

// Middleware to extract token from headers
function extractToken(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    req.accessToken = token;
    next();
}

router.use('/api/hubs', extractToken);

router.get('/api/hubs', async function (req, res, next) {
    try {
        const hubs = await getHubs(req.accessToken);
        res.json(hubs.map(hub => ({ id: hub.id, name: hub.attributes.name })));
    } catch (err) {
        next(err);
    }
});

router.get('/api/hubs/:hub_id/projects', async function (req, res, next) {
    try {
        const projects = await getProjects(req.params.hub_id, req.accessToken);
        res.json(projects.map(project => ({ id: project.id, name: project.attributes.name })));
    } catch (err) {
        next(err);
    }
});

router.get('/api/hubs/:hub_id/projects/:project_id/contents', async function (req, res, next) {
    try {
        const entries = await getProjectContents(req.params.hub_id, req.params.project_id, req.query.folder_id, req.accessToken);
        res.json(entries.map(entry => ({ id: entry.id, name: entry.attributes.displayName, folder: entry.type === 'folders' })));
    } catch (err) {
        next(err);
    }
});

router.get('/api/hubs/:hub_id/projects/:project_id/contents/:item_id/versions', async function (req, res, next) {
    try {
        const versions = await getItemVersions(req.params.project_id, req.params.item_id, req.accessToken);
        res.json(versions.map(version => ({ id: version.id, name: version.attributes.createTime })));
    } catch (err) {
        next(err);
    }
});

module.exports = router;
