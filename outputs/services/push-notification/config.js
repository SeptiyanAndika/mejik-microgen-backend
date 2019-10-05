const appRoot = require('app-root-path');
require("dotenv").config({ path: appRoot.path + '/.env'  });

module.exports = {
    APP_ID : process.env.APP_ID,
    REST_API_KEY :  process.env.REST_API_KEY,
    HOST:process.env.NOTIFICATION_HOST,
    PORT:process.env.NOTIFICATION_PORT,
    MONGODB:process.env.NOTIFICATION_MONGODB,
    NOTIFICATION_COTE:process.env.NOTIFICATION_COTE,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    feathers:{
        paginate:{
            default: 20,
            limit: 20
        }
    }

}