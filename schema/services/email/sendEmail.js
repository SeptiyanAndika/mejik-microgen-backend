const { SENDGRID_API, application, email } = require("./config");
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(SENDGRID_API)

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
	let emailTitle = ``
	if (title) {
		emailTitle = `
		<h1 
			style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color:#474a52;
			font-weight: bold; letter-spacing: 0.5px; padding: 0px 20px 0px 20px; font-size: 25px; text-align: center"
		>
			${title}
		</h1>`
	}

	let headerImage = ``
	emailImageHeader = emailImageHeader || email.logo
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

	try {
		sgMail.send({
			to: to,
			from: { email: from, name: application.name },
			subject: subject,
			html: `
			<div style="background: #fdfdfd; padding: 100px 20px;">
				<div
					style="max-width: 550px; min-width: 250px; background: #fff; margin: 0 auto; padding: 10px 20px; border-radius: 5px; border: 1px solid #f0f0f0;">
					${headerImage}
					${emailTitle}
					<div
						style="font-size: 16px; font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif; color: #474a52; line-height: 24px; text-align: center; margin: 0 20px;"
					>
						${body}
					</div>
					${buttonLink}
				</div>
			</div>`
		});
		return "success"
	} catch (error) {
		console.log(error)
		return error
	}
};

module.exports = sendEmail;