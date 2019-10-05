const appRoot = require('app-root-path')
require("dotenv").config({ path: appRoot.path + '/.env'  })

const HOST = process.env.SERVER_HOST
const PORT = process.env.SERVER_PORT
const COTE = process.env.SERVER_COTE
const MONGODB = process.env.SERVER_MONGODB

module.exports = {
    HOST: HOST,
    PORT: PORT,
    MONGODB: MONGODB,
    COTE: COTE,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    feathers:{
        paginate:{
            default: 20,
            limit: 20
        }
    }

}