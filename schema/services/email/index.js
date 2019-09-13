const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");
const { SENDGRID_API } = require("./config");

exports.sendEmail = async (email, from, subject, body) => {
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
		html: body
	});
};
