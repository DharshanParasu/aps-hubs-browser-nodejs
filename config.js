const { Scopes } = require('@aps_sdk/authentication');
require('dotenv').config();

let { APS_ACCESS_TOKEN, SERVER_SESSION_SECRET, PORT } = process.env;
if (!APS_ACCESS_TOKEN || !SERVER_SESSION_SECRET) {
    console.warn('Missing some of the environment variables.');
    process.exit(1);
}
PORT = PORT || 8080;

module.exports = {
    APS_ACCESS_TOKEN,
    SERVER_SESSION_SECRET,
    PORT
};
