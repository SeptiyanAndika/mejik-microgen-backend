const { SENDGRID_API, REDIS_HOST, REDIS_PORT, email, application } = require("./config");
const cote = require("cote")({ redis: { host: REDIS_HOST, port: REDIS_PORT } });
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(SENDGRID_API)
const emailService = new cote.Responder({
	name: "Email Service",
	key: "email"
});

const userRequester = new cote.Requester({
	name: "User Requester",
	key: "user"
});

const emailRequester = new cote.Requester({
	name: "Email Requester",
	key: "email"
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
			emailRequester.send({ type: "send", body: { ...req.body, from, to } });
		} else {
			emailRequester.send({ type: "send", body: { ...req.body, from: email.from, to } });
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
		const users = await userRequester.send({ type: "index" })
		users.map(user => {
			to.push({ email: user.email })
		})
		if (from = req.body.from) {
			emailRequester.send({ type: "send", body: { ...req.body, from, to } });
		} else {
			emailRequester.send({ type: "send", body: { ...req.body, from: email.from, to } });
		}
		cb(null, { message: "Success." });
	} catch (error) {
		cb(error.message, null);
	}
});

const sendEmail = async ({
	to,
	from,
	subject,
	emailImageHeader,
	title,
	body,
	emailLink,
	emailVerificationCode
}) => {
	let headerImage = ``
	if (emailImageHeader) {
		headerImage = `
		<div style="margin: 10px 20px;">
			<img 
				src=${emailImageHeader}
				alt="header" 
				width="200px" 
			/>
		</div>`

	}

	let buttonLink = ``
	if (emailLink) {
		buttonLink = `
		<a href=${emailLink} style="text-decoration: none">
			<div
				style="padding: 1px; background-color: #2480d1; border-radius: 10px; margin: 20px 30px; cursor: pointer;">
				<p
					style="text-align: center; font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif; color: #fff; margin: 13px">
					Open
				</p>
			</div>
		</a>`
	}

	if (emailVerificationCode) {
		body += `
		<div 
			style="height:38px;line-height:38px;font-weight:bold;margin:15px 10px;border:1px dashed #979797"
			align="center"
		>
			${emailVerificationCode}
		</div>
		<div
			style="font-size: 16px; font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif; color: #474a52; line-height: 24px; text-align: center; margin: 0 20px;"
		>
			You can also verify your email via the button below:
		</div>`
	}

	sgMail.send({
		to: to,
		from: { email: from, name: application.name },
		subject: subject,
		html: `
		<div style="background: #fdfdfd; padding: 100px 20px;">
			<div
				style="max-width: 550px; min-width: 250px; background: #fff; margin: 0 auto; padding: 10px 20px; border-radius: 5px; border: 1px solid #f0f0f0;">
				${headerImage}
				<h1 
					style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color:#474a52;
					font-weight: bold; letter-spacing: 0.5px; padding: 0px 20px 0px 20px; font-size: 25px; text-align: center"
				>
					${title}
				</h1>
				<div
					style="font-size: 16px; font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif; color: #474a52; line-height: 24px; text-align: center; margin: 0 20px;"
				>
					${body}
				</div>
				${buttonLink}
			</div>
		</div>`
	});
};

module.exports = sendEmail;
