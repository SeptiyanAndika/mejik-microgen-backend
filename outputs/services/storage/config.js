const appRoot = require('app-root-path');
require("dotenv").config({ path: appRoot.path + '/.env'  });

module.exports = {
    ACCESS_KEY: process.env.ACCESS_KEY,
    SECRET_KEY: process.env.SECRET_KEY,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    STORAGE_COTE: process.env.STORAGE_COTE
}