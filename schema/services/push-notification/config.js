require('dotenv').config()

module.exports = {
    APP_ID : process.env.APP_ID,
    REST_API_KEY :  process.env.REST_API_KEY,
    HOST:process.env.HOST,
    PORT:process.env.PORT,
    MONGODB:process.env.MONGODB,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,


    feathers:{
        paginate:{
            default: 20,
            limit: 20
        }
    }

}