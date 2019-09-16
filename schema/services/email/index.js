const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");
const { SENDGRID_API, REDIS_HOST, REDIS_PORT } = require("./config");
const cote = require("cote")({ redis: { host: REDIS_HOST, port: REDIS_PORT } });
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
		await sendEmail(req.body);
	} catch (err) {
		throw err;
	}
});

emailService.on("store", async (req, cb) => {
	try {
		const isAdmin = await userRequester.send({
			type: "verifyToken",
			token: req.headers.authorization
		})
		if (isAdmin.user.role === 'admin') {
			const users = await userRequester.send({ type: "index" })
			users.map(user => {
				emailRequester.send({ type: "send", body: { ...req.body, email: user.email } });
			})
		}
		cb(null, { message: "Success." });
	} catch (error) {
		cb(error.message, null);
	}
});

const sendEmail = async ({
	email,
	from,
	subject,
	emailImageHeader,
	emailTitle,
	emailBody,
	emailLink
}) => {
	const transport = nodemailer.createTransport(
		sendgrid({
			auth: {
				api_key: SENDGRID_API
			}
		})
	);

	await transport.sendMail({
		to: email,
		from: from,
		subject: subject,
		html: `<div style="background: #f4f5f7; padding: 100px">
		<div
			style="max-width: 600px; background: #fff; margin: 0 auto;  padding: 10px 0"
		>
			<div style="margin: 20px 20px 0;">
				<img
					src=${emailImageHeader}
					alt="header"
					width="200px"
				/>
			</div>
			<h1
				style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;color: #282e33;
				font-weight: bold;
				letter-spacing: 0.5px;
				padding: 0px 20px 0px 20px;
				font-size: 25px;
				text-align: center"
			>
				${emailTitle}
			</h1>
			<p
				style="font-size: 16px; font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif; color: #474a52; line-height: 24px; text-align: center; margin: 0 20px"
			>
				${emailBody}
			</p>
			<a href=${emailLink} style="text-decoration: none">
				<div
					style="padding: 1px; background-color: #2480d1; border-radius: 20px; margin: 25px 30px; cursor: pointer;"
				>
					<p
						style="text-align: center; font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif; color: #fff"
					>
						Open
					</p>
				</div>
			</a>
		</div>
	</div>`
	});
};

module.exports = sendEmail;
