const nodemailer = require("nodemailer");
// eslint-disable-next-line no-unused-vars
const { google } = require("googleapis");


const oauth2Client = new google.auth.OAuth2(
	process.env.OAUTH_CLIENT_ID,
	process.env.OAUTH_CLIENT_SECRET,
	process.env.OAUTH_REDIRECT_URL
);

// Configurações de credenciais
oauth2Client.setCredentials({
	refresh_token: process.env.OAUTH_REFRESH_TOKEN
});

const accessToken = oauth2Client.getAccessToken();

// Cria um transporte de email com OAuth2
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		type: "OAuth2",
		user: process.env.EMAIL_USER,
		clientId: process.env.OAUTH_CLIENT_ID,
		clientSecret: process.env.OAUTH_CLIENT_SECRET,
		refreshToken: process.env.OAUTH_REFRESH_TOKEN,
		accessToken: accessToken,
	}
});

module.exports = transporter;   
