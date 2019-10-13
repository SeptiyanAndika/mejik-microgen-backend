'use strict';

require('dotenv').config();

module.exports = {
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_HOST: process.env.REDIS_HOST,
    APP_NAME: process.env.APP_NAME,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    GRAPHQL_PORT: process.env.GRAPHQL_PORT,
    GRAPHQL_PLAYGROUND: process.env.GRAPHQL_PLAYGROUND
};