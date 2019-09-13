require('dotenv').config()

module.exports = {
    HOST:process.env.HOST,
    PORT:process.env.PORT,
    MONGODB:process.env.MONGODB,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT
}