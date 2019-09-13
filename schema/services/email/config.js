require("dotenv").config();

module.exports = {
	SENDGRID_API: process.env.SENDGRID_API,
	REDIS_PORT: process.env.REDIS_PORT,
	REDIS_HOST: process.env.REDIS_HOST
};
