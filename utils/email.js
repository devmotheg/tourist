/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const path = require("path");
const nodemailer = require("nodemailer"),
	pug = require("pug"),
	{ htmlToText } = require("html-to-text");

// Robust email handler
class Email {
	constructor(user, url) {
		this.from = process.env.EMAIL_FROM;
		this.to = user.email;
		this.toName = user.name.split(" ")[0];
		this.url = url;
	}

	// 1) Define a transporter to send the email through
	newTransporter() {
		if (process.env.NODE_ENV === "development") {
			return nodemailer.createTransport({
				host: process.env.MAILTRAP_HOST,
				port: process.env.MAILTRAP_PORT,
				auth: {
					user: process.env.MAILTRAP_USERNAME,
					pass: process.env.MAILTRAP_PASSWORD,
				},
			});
		}

		return nodemailer.createTransport({
			service: "SendGrid",
			auth: {
				user: process.env.SENDGRID_USERNAME,
				pass: process.env.SENDGRID_PASSWORD,
			},
		});
	}

	// 2) Define email options and send the email
	async send(template, subject) {
		const html = pug.renderFile(
			path.join(__dirname, `../views/emails/${template}.pug`),
			{ toName: this.toName, url: this.url, subject }
		);

		const mailOptions = {
			from: `Mohamed Muntasir <${process.env.EMAIL_FROM}>`,
			to: this.to,
			subject,
			html,
			text: htmlToText(html),
		};

		await this.newTransporter().sendMail(mailOptions);
	}

	async sendWelcome() {
		await this.send("welcome", "Tourist - Sign up Welcome");
	}

	async sendResetPassword() {
		await this.send("reset-password", "Tourist - Password Reset");
	}
}

module.exports = Email;
