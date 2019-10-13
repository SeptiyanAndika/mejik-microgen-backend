const appRoot = require('app-root-path');
require("dotenv").config({ path: appRoot.path + '/.env'  });

module.exports = {
    ONESIGNAL_APP_ID : process.env.ONESIGNAL_APP_ID,
    ONESIGNAL_REST_API_KEY :  process.env.ONESIGNAL_REST_API_KEY,
    HOST:process.env.NOTIFICATION_HOST,
    PORT:process.env.NOTIFICATION_PORT,
    MONGODB:process.env.NOTIFICATION_MONGODB,
    NOTIFICATION_COTE_PORT:process.env.NOTIFICATION_COTE_PORT,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    feathers:{
        paginate:{
            default: 20,
            limit: 20
        }
    }

}