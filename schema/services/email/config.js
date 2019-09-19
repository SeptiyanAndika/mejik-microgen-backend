require("dotenv").config();
const { email, app } = require('../../config')

module.exports = {
	SENDGRID_API: process.env.SENDGRID_API,
	REDIS_PORT: process.env.REDIS_PORT,
	REDIS_HOST: process.env.REDIS_HOST,
	email: {
		from: email.from,
		emailImageHeader: email.logo
	},
	application: {
		name: app.name
	}
};
