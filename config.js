require('dotenv').config();

let { SERVER_SESSION_SECRET, PORT } = process.env;
if (!SERVER_SESSION_SECRET) {
    console.warn('Missing some of the environment variables.');
    process.exit(1);
}
PORT = PORT || 8080;

module.exports = {
    SERVER_SESSION_SECRET,
    PORT
};
