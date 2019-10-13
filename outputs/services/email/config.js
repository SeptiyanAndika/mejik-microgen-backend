const appRoot = require('app-root-path');
require("dotenv").config({ path: appRoot.path + '/.env'  });

module.exports = {
	SENDGRID_API: process.env.SENDGRID_API,
	REDIS_PORT: process.env.REDIS_PORT,
	REDIS_HOST: process.env.REDIS_HOST,
	EMAIL_COTE_PORT: process.env.EMAIL_COTE_PORT,
	email: {
		from: `${process.env.APP_NAME}@microgen.com`,
		logo: null
	},
	application: {
		name: process.env.APP_NAME
	}
};
