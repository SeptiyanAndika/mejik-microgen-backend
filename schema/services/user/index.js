const { HOST, REDIS_HOST, REDIS_PORT, forgetPasswordExpired, email, application } = require("./config");
const app = require("./src/app");
const port = app.get("port");
const server = app.listen(port);
const checkPermissions = require("feathers-permissions");
const { permissions } = require("./permissions");
const cote = require("cote")({ redis: { host: REDIS_HOST, port: REDIS_PORT } });
const bcrypt = require("bcryptjs");
const ObjectId = require('mongodb').ObjectID;
const userService = new cote.Responder({
	name: "User Service",
	key: "user"
});

const emailRequester = new cote.Requester({
	name: "Email Requester",
	key: "email"
});

userService.on("index", async (req, cb) => {
	try {
		let token = req.headers.authorization;
		let verify = await app
			.service("authentication")
			.verifyAccessToken(token);
		let user = await app.service("users").get(verify.sub);
		if (user.role !== 'admin') {
			throw Error(UnAuthorized)
		}
		const users = await app.service("users").find({
			query: req.query,
		});
		cb(null, users.data);
	} catch (error) {
		cb(error.message, null);
	}
});

userService.on("indexConnection", async (req, cb) => {
	try {
		let token = req.headers.authorization;
		let verify = await app
			.service("authentication")
			.verifyAccessToken(token);
		let user = await app.service("users").get(verify.sub);
		if (user.role !== 'admin') {
			throw Error(UnAuthorized)
		}
		const users = await app.service("users").find({
			query: req.query
		});
		cb(null, users);
	} catch (error) {
		cb(error.message, null);
	}
});

userService.on("show", async (req, cb) => {
	try {
		let token = req.headers.authorization;
		let data = null;
		if (req._id) {
			data = await app.service("users").get(req._id, {
				token
			});
		}
		cb(null, data);
	} catch (error) {
		cb(error.message, null);
	}
});

userService.on("user", async (req, cb) => {
	try {
		let token = req.headers.authorization;
		let data = null;

		let verify = await app
			.service("authentication")
			.verifyAccessToken(token);
		let user = await app.service("users").get(verify.sub);

		data = await app.service("users").get(user._id, {
			query: req.query,
			token
		});

		cb(null, data);
	} catch (error) {
		cb(error.message, null);
	}
});

userService.on("login", async (req, cb) => {
	try {
		const user = await app.service("authentication").create({
			strategy: "local",
			...req.body
		});
		user.token = user.accessToken;
		cb(null, user);
	} catch (error) {
		cb(error.message, null);
	}
});

userService.on("loginWithGoogle", async (req, cb) => {
	try {
		let result = await app.get('parseGoogleToken')(req.body.jwtToken)
		let payload = result.getPayload();
		payload = {
			email: payload.email,
			firstName: payload.given_name,
			lastName: payload.family_name,
			role: 'authenticated',
			strategy: 'google',
			status: 1
		}
		let users = await app.service("users").find({
			query:{
				email: payload.email
			}
		})
		let user = null
		let token = null
		if(users.data.length > 0){
			let auth = await app.service("authentication").create({
				strategy: 'google',
				user: users.data[0]
			},{
				authStrategies: ['google']
			});
			token = auth.accessToken
			user = auth.user
		}else{
			const createUser = await app.service("users").create(payload);
			let auth = await app.service("authentication").create({
				strategy: 'google',
				user: createUser
			},{
				authStrategies: ['google']
			});
			token = auth.accessToken
			user = auth.user
		}
		cb(null, {
			token,
			user
		})
	} catch (error) {
		cb(error.message, null);
	}
});

userService.on("loginWithFacebook", async (req, cb) => {
	try {
		let result = await app.get('parseFacebookToken')(req.body.jwtToken)
		let payload = result.data
		payload = {
			_id: ObjectId(JSON.parse(payload.id)),
			email: payload.email,
			firstName: payload.first_name,
			lastName: payload.last_name,
			role: 'authenticated',
			strategy: 'facebook',
			status: 0
		}
		let users = await app.service("users").find({
			query:{
				email: payload.email,
			}
		})
		let user = null
		let token = null
		if(users.data.length > 0){
			let auth = await app.service("authentication").create({
				strategy: 'facebook',
				user: users.data[0]
			},{
				authStrategies: ['facebook']
			});
			token = auth.accessToken
			user = auth.user
		}else{
			const createUser = await app.service("users").create(payload);
			let auth = await app.service("authentication").create({
				strategy: 'facebook',
				user: createUser
			},{
				authStrategies: ['facebook']
			});
			token = auth.accessToken
			user = auth.user
		}
		cb(null, {
			token,
			user
		})
	} catch (error) {
		cb(error.message, null);
	}
});

userService.on("forgetPassword", async (req, cb) => {
	try {
		let users = await app.service("users").find({
			query: {
				email: req.body.email
			}
		});
		if (users.length == 0) {
			console.log("email not registered");
			cb(null, {
				message: "Success."
			});
			return;
		}
		req.body.token = bcrypt.genSaltSync();
		await app.service("forgetPasswords").create(req.body);
		emailRequester.send({
			type: "send",
			body: {
				to: req.body.email,
				subject: "Forget Password",
				emailImageHeader: email.emailImageHeader,
				title: "You are forget password",
				body: `You are receiving this email as you have requested to change your account password. Click the button below to reset your password`,
				emailLink: HOST + "/user/resetPassword?token=" + req.body.token,
			}
		});
		cb(null, {
			message: "Success."
		});
	} catch (error) {
		cb(error.message, null);
	}
});

userService.on("resetPassword", async (req, cb) => {
	try {
		let data = await app.service("forgetPasswords").find({
			query: {
				token: req.body.token
			}
		});
		if (data.length == 0) {
			throw new Error("Token is not exist");
		}
		data = data[0];
		const d1 = new Date(data.createdAt);
		const d2 = new Date();
		const timeDiff = d2.getTime() - d1.getTime();
		const daysDiff = timeDiff / (1000 * 3600 * 24);
		if (daysDiff > forgetPasswordExpired) {
			throw new Error("Expired.");
		}

		await app.service("users").patch(
			null,
			{ password: req.body.newPassword },
			{
				query: {
					email: data.email
				}
			}
		);
		await app.service("forgetPasswords").remove(null, {
			params: {
				query: {
					email: data.email
				}
			}
		});
		cb(null, {
			message: "Success."
		});
	} catch (error) {
		cb(error.message, null);
	}
});

userService.on("verifyEmail", async (req, cb) => {
	try {
		let data = await app.service("emailVerifications").find({
			query: {
				token: req.body.token
			}
		});
		if (data.length == 0) {
			throw new Error("Token is not exist");
		}
		data = data[0];
		// const d1 = new Date(data.createdAt);
		// const d2 = new Date();
		// const timeDiff = d2.getTime() - d1.getTime();
		// const daysDiff = timeDiff / (1000 * 3600 * 24);
		// if (daysDiff > forgetPasswordExpired) {
		// 	throw new Error("Expired.");
		// }

		await app.service("users").patch(
			null,
			{ status: 1 },
			{
				query: {
					email: data.email
				}
			}
		);
		await app.service("emailVerifications").remove(null, {
			params: {
				query: {
					email: data.email
				}
			}
		});
		cb(null, {
			message: "Success."
		});
	} catch (error) {
		cb(error.message, null);
	}
});

userService.on("changePassword", async (req, cb) => {
	try {
		let token = req.headers.authorization;
		let verify = await app
			.service("authentication")
			.verifyAccessToken(token);
		let user = await app.service("users").get(verify.sub);
		let isValid = bcrypt.compareSync(req.body.oldPassword, user.password);
		if (isValid) {
			const auth = await app
				.service("users")
				.patch(user._id, { password: req.body.newPassword });
			cb(null, {
				status: 1,
				message: "Success"
			});
		} else {
			cb(new Error("UnAuthorized").message, null);
		}
	} catch (error) {
		cb(error, null);
	}
});

userService.on("register", async (req, cb) => {
	try {
		const user = await app.service("users").create({
			...req.body,
			role: "authenticated"
		});

		const auth = await app.service("authentication").create({
			strategy: "local",
			email: req.body.email,
			password: req.body.password
		});

		const emailToken = bcrypt.genSaltSync();
		await app.service("emailVerifications").create({
			email: req.body.email,
			token: emailToken
		});
		emailRequester.send({
			type: "send",
			body: {
				to: req.body.email,
				subject: `${application.name} Verification`,
				emailImageHeader: email.emailImageHeader,
				title: "Verify Your Email Immediately",
				body: `Thank you for joining! To verify your email click the button below:`,
				emailLink: HOST + "/user/verify?token=" + emailToken
			}
		});
		cb(null, {
			user,
			token: auth.accessToken
		});
	} catch (error) {
		cb(error.message, null);
	}
});

userService.on("createUser", async (req, cb) => {
	try {
		let token = req.headers.authorization;
		let verify = await app
			.service("authentication")
			.verifyAccessToken(token);
		let admin = await app.service("users").get(verify.sub, {
			query: {
				$select: ["_id", "email", "firstName", "lastName", "role"]
			}
		});
		admin.permissions = permissions[admin.role];

		const user = await app.service("users").create(
			{ ...req.body },
			{ type: "createUser", user: admin }
		);

		const auth = await app.service("authentication").create({
			strategy: "local",
			email: req.body.email,
			password: req.body.password
		});

		cb(null, {
			user,
			token: auth.accessToken
		});
	} catch (error) {
		cb(error.message, null);
	}
});

userService.on("changeProfile", async (req, cb) => {
	try {
		let token = req.headers.authorization;
		let verify = await app
			.service("authentication")
			.verifyAccessToken(token);
		let user = await app.service("users").get(verify.sub);
		let data = await app.service("users").patch(user._id, req.body, {
			...req.params || {},
			token
		})
		cb(null, data);
	} catch (error) {
		cb(error.message, null);
	}
});

userService.on("updateUser", async (req, cb) => {
	try {
		let token = req.headers.authorization;
		let data = await app.service("users").patch(req._id, req.body, {
			...req.params || {},
			token
		})
		cb(null, data);
	} catch (error) {
		cb(error.message, null);
	}
});

userService.on("deleteUser", async (req, cb) => {
	try {
		let token = req.headers.authorization;
		let data = await app.service("users").remove(req._id, {
			...req.params || {},
			token
		})
		data.id = data._id
		cb(null, data);
	} catch (error) {
		cb(error.message, null);
	}
});

userService.on("verifyToken", async (req, cb) => {
	try {
		// console.log("verify token", app.service("authentication"))
		if (!req.token) {
			cb(null, {
				user: {
					permissions: permissions["public"]
				}
			});
			return;
		}
		let verify = await app
			.service("authentication")
			.verifyAccessToken(req.token);
		let user = await app.service("users").get(verify.sub, {
			query: {
				$select: ["_id", "email", "firstName", "lastName", "role"]
			}
		});

		user.permissions = permissions[user.role];
		if (!user.permissions) {
			throw new Error("UnAuthorized");
		}
		verify.user = user;
		cb(null, verify);
	} catch (error) {
		cb(error.message, null);
	}
});

app.service("users").hooks({
	before: {
		create: async context => {
			let users = await app.service("users").find();
			if (users.length == 0) {
				context.data.role = "admin";
				context.data.status = 1;
			}

			if (context.params.type == "createUser") {
				context.method = "createUser";
				await checkPermissions({
					roles: ["admin"]
				})(context);

				if (!context.params.permitted) {
					throw Error("UnAuthorized");
				}
			}
		},
		update: async context => {
			if (!context.params.token) {
				cb(null, {
					user: { permissions: permissions["public"] }
				});
				return;
			}

			let verify = await app
				.service("authentication")
				.verifyAccessToken(context.params.token);
			let user = await app.service("users").get(verify.sub, {
				query: {
					$select: ["_id", "email", "firstName", "lastName", "role"]
				}
			});

			user.permissions = permissions[user.role];
			if (!user.permissions) {
				throw new Error("UnAuthorized");
			}

			context.params.user = user

			await checkPermissions({
				roles: ["admin"]
			})(context);

			if (!context.params.permitted) {
				throw Error("UnAuthorized");
			}
		},
		remove: async context => {
			if (!context.params.token) {
				cb(null, {
					user: { permissions: permissions["public"] }
				});
				return;
			}

			let verify = await app
				.service("authentication")
				.verifyAccessToken(context.params.token);
			let user = await app.service("users").get(verify.sub, {
				query: {
					$select: ["_id", "email", "firstName", "lastName", "role"]
				}
			});

			user.permissions = permissions[user.role];
			if (!user.permissions) {
				throw new Error("UnAuthorized");
			}

			context.params.user = user

			await checkPermissions({
				roles: ["admin"]
			})(context);

			if (!context.params.permitted) {
				throw Error("UnAuthorized");
			}
		}
	},
});

server.on("listening", () =>
	console.log(
		"User application started on http://%s:%d",
		app.get("host"),
		port
	)
);
