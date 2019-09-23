const appRoot = require('app-root-path');
require("dotenv").config({ path: appRoot.path + '/.env'  });

module.exports = {
	REDIS_PORT: process.env.REDIS_PORT,
	REDIS_HOST: process.env.REDIS_HOST,
	HOST: process.env.USER_HOST,
	PORT: process.env.USER_PORT,
	MONGODB: process.env.USER_MONGODB,

	forgetPasswordExpired: 1,
	application: {
		name: process.env.APP_NAME.slice(0, 1).toUpperCase() + process.env.APP_NAME.slice(1)
	},
	feathers: {
		paginate: {
			default: 20,
			limit: 20
		},
		authentication: {
			entity: "user",
			service: "users",
			secret: "dkWG2RZXO3u4mOgJKXxmWE0mUWM=",
			authStrategies: ["jwt", "local"],
			jwtOptions: {
				header: {
					typ: "access"
				},
				audience: "https://yourdomain.com",
				issuer: "feathers",
				algorithm: "HS256",
				expiresIn: "1d"
			},
			local: {
				usernameField: "email",
				passwordField: "password"
			},
			oauth: {
				"redirect": "/frontend",
				google: {
					clientID: process.env.GOOGLE_CLIENT_ID,
					clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				}
			}
		}
	}
};
