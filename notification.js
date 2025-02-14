const nodemailer = require('nodemailer');
const mustache = require('mustache');
const fs = require('fs');
const exec = require('child_process').exec;

const XSS_PAYLOAD_FIRE_EMAIL_TEMPLATE = fs.readFileSync(
	'./templates/xss_email_template.htm',
	'utf8'
);

const XSS_PAYLOAD_FIRE_TELEGRAM_TEMPLATE = fs.readFileSync(
	'./templates/xss_telegram_template.md',
	'utf8'
);

async function send_email_notification(xss_payload_fire_data) {
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: parseInt(process.env.SMTP_PORT),
		secure: (process.env.SMTP_USE_TLS === "true"),
		auth: {
			user: process.env.SMTP_USERNAME,
			pass: process.env.SMTP_PASSWORD,
		},
	});

	const notification_html_email_body = mustache.render(
		XSS_PAYLOAD_FIRE_EMAIL_TEMPLATE, 
		xss_payload_fire_data
	);

	const info = await transporter.sendMail({
		from: process.env.SMTP_FROM_EMAIL,
		to: process.env.SMTP_RECEIVER_EMAIL,
		subject: `[XSS Hunter Express] XSS Payload Fired On ${xss_payload_fire_data.url}`,
		text: "Only HTML reports are available, please use an email client which supports this.",
		html: notification_html_email_body,
	});

	console.log("Message sent: %s", info.messageId);
}

async function send_notify_notification(xss_payload_fire_data, provider_config_name = "config") {
	const notification_md_telegram = mustache.render(
		XSS_PAYLOAD_FIRE_TELEGRAM_TEMPLATE,
		xss_payload_fire_data
	);

	exec(`echo '${notification_md_telegram}' | /opt/notify -bulk -provider-config /app/providers/${provider_config_name}.yaml`)
}

module.exports.send_email_notification = send_email_notification;
module.exports.send_notify_notification = send_notify_notification;
