const { AuthenticationClient, ResponseType } = require('@aps_sdk/authentication');
const { DataManagementClient } = require('@aps_sdk/data-management');
const { APS_ACCESS_TOKEN } = require('../config.js');

const authenticationClient = new AuthenticationClient();
const dataManagementClient = new DataManagementClient();
const service = module.exports = {};

service.authRefreshMiddleware = (req, res, next) => {
    req.internalOAuthToken = {
        access_token: APS_ACCESS_TOKEN,
        expires_in: 3600, // 1 hour default
    };
    req.publicOAuthToken = {
        access_token: APS_ACCESS_TOKEN,
        expires_in: 3600, // 1 hour default
    };
    next();
};

service.getUserProfile = async (accessToken) => {
    const resp = await authenticationClient.getUserInfo(accessToken);
    return resp;
};

service.getHubs = async (accessToken) => {
    const resp = await dataManagementClient.getHubs({ accessToken });
    return resp.data;
};

service.getProjects = async (hubId, accessToken) => {
    const resp = await dataManagementClient.getHubProjects(hubId, { accessToken });
    return resp.data;
};

service.getProjectContents = async (hubId, projectId, folderId, accessToken) => {
    if (!folderId) {
        const resp = await dataManagementClient.getProjectTopFolders(hubId, projectId, { accessToken });
        return resp.data;
    } else {
        const resp = await dataManagementClient.getFolderContents(projectId, folderId, { accessToken });
        return resp.data;
    }
};

service.getItemVersions = async (projectId, itemId, accessToken) => {
    const resp = await dataManagementClient.getItemVersions(projectId, itemId, { accessToken });
    return resp.data;
};
