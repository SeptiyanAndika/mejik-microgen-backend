const { REDIS_HOST, REDIS_PORT, email, EMAIL_COTE } = require("./config");
const cote = require("cote")({ redis: { host: REDIS_HOST, port: REDIS_PORT } });
const sendEmail = require('./sendEmail')

const emailService = new cote.Responder({
	name: "Email Service",
	key: "email"
});

const userRequester = new cote.Requester({
	name: "User Requester",
	key: "user",
	port: EMAIL_COTE
});

emailService.on("send", async (req, cb) => {
	try {
		await sendEmail({ ...req.body, from: email.from });
	} catch (err) {
		throw err;
	}
});

emailService.on("sendToUser", async (req, cb) => {
	try {
		const isAdmin = await userRequester.send({
			type: "verifyToken",
			token: req.headers.authorization
		})
		if (isAdmin.user.role !== 'admin') {
			throw new Error("UnAuthorized");
		}

		let to = []
		const emailSplit = req.body.to.split(';')
		emailSplit.map(email => to.push({ email: email }))

		if (from = req.body.from) {
			sendEmail({ ...req.body, from, to });
		} else {
			sendEmail({ ...req.body, from: email.from, to });
		}
		cb(null, { message: "Success." });
	} catch (error) {
		cb(error.message, null);
	}
});

emailService.on("sendToUsers", async (req, cb) => {
	try {
		const isAdmin = await userRequester.send({
			type: "verifyToken",
			token: req.headers.authorization
		})
		if (isAdmin.user.role !== 'admin') {
			throw new Error("UnAuthorized");
		}

		let to = []
		const users = await userRequester.send({ type: "find", headers: req.headers })
		users.map(user => {
			to.push({ email: user.email })
		})

		if (from = req.body.from) {
			sendEmail({ ...req.body, from, to });
		} else {
			sendEmail({ ...req.body, from: email.from, to });
		}
		cb(null, { message: "Success." });
	} catch (error) {
		cb(error.message, null);
	}
});
