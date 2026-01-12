const { cleanEnv, str, port, url } = require('envalid');

function validateEnv() {
    cleanEnv(process.env, {
        NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'] }),
        PORT: port(),
        MONGO_URI: str(),
        JWT_SECRET: str(),
        EMAIL_USER: str(),
        EMAIL_PASS: str(),
        FRONTEND_URL: url({ desc: 'The URL of the frontend application' }),
        // Add other required env vars here
    });
}

module.exports = validateEnv;
