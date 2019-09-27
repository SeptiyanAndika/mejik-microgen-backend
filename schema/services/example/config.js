
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