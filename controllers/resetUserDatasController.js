const User = require("../models/Models");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const mailer = require("../config/mailer");
const validate = require("../config/valdiates");
const owasp = require("owasp-password-strength-test");
const admin = require("firebase-admin");


function generateEmailCode() {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const bytes = crypto.randomBytes(6);
	let code = "";
	for (let i = 0; i < bytes.length; i++) {
		code += chars[bytes[i] % chars.length];
	}
	return code;
}

const forgotPasswordFunctions = {
	sendEmail: async (req, res) => {
		const { email } = req.body;
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).send("User not found");
		}

		const resetToken = crypto.randomBytes(20).toString("hex");
		user.resetToken = resetToken;
		user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
		await user.save();

		const resetLink = `http://localhost:3000/user/reset-password-page?token=${resetToken}`;
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: "Password Reset",
			html: `here your token ${resetLink}`
		};

		mailer.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.log(error);
			} else {
				console.log("Email sent: " + info.response);
			}
		});

		res.send("Password reset email sent");
	},
	sendEmailToVerify: async (req, res) => {
		const email = req.body.email;
		const uid = req.body.uid;
		const oldEmail = req.body.oldEmail;

		if (oldEmail) {
			const userRecord = await admin.auth().getUserByEmail(oldEmail);
			const oldUid = userRecord.uid;
			// Deletar o usuário pelo UID
			await admin.auth().deleteUser(oldUid);
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).send("User not found");
		}
		admin.auth().updateUser(uid, { email })
			.then((userRecord) => {
				console.log("E-mail do usuário atualizado com sucesso", userRecord.toJSON());
			})
			.catch((error) => {
				console.log("Erro ao atualizar o e-mail:", error);
			});

		await admin.auth().updateUser(uid, { emailVerified: true });

		const tokenVerify = crypto.randomBytes(20).toString("hex");
		user.tokenVerify = tokenVerify;
		user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
		await user.save();

		const resetLink = `http://localhost:3000/user/LinkToVerifyToke?token=${tokenVerify}`;
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: "verify your account",
			html: `here your link to verify tour account ${resetLink}`
		};

		mailer.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.log(error);
			} else {
				console.log("Email sent: " + info.response);
			}
		});

		res.send("Password reset email sent");
	},
	verifyToken: async (req, res) => {

		try {
			const token = req.query.token;

			const userSelected = await User.findOne({ tokenVerify: token, resetTokenExpiration: { $gt: Date.now() } });

			if (!userSelected) {
				userSelected.findOneAndremove({ tokenVerify: token });
				return res.status(400).send("User not exist or token invalid");
			}

			const uid = userSelected._id.toString();

			await admin.auth().updateUser(uid, { emailVerified: true });

			userSelected.tokenVerify = undefined;
			userSelected.verified = true;
			await userSelected.save();

			res.redirect("/user/emailVerified");

		} catch (error) {
			console.error("Erro ao marcar email como verificado:", error);
			res.status(500).send("Erro ao marcar email como verificado no Firebase.");
		}


	},
	resetPassword: async (req, res) => {
		const { error } = validate.tokenValidates(req.body);

		if (error) {
			return res.status(400).send(error.message);
		}

		const user = await User.findOne({ resetToken: req.body.resetToken, resetTokenExpiration: { $gt: Date.now() } });
		if (!user) {
			console.log(user);
			return res.status(400).send("Invalid or expired token");
		}

		const newPasswordMatch = bcrypt.compareSync(req.body.newPassword, user.password);
		if (newPasswordMatch) return res.status(400).send("This password is already being used by you");

		const passwordStrength = owasp.test(req.body.newPassword);
		if (!passwordStrength.strong) {
			const reasons = passwordStrength.errors.join(", ");
			return res.status(400).send(`Password does not meet the OWASP password strength requirements. Reasons: ${reasons}`);
		}
		// Update password and clear reset token fields
		user.password = bcrypt.hashSync(req.body.newPassword);
		user.resetToken = undefined;
		user.resetTokenExpiration = undefined;
		await user.save();

		res.send("Password reset successful");
	},
	resetUsername: async (req, res) => {
		const { error } = validate.usernameValidates(req.body);
		const userId = req._id;

		if (error) {
			console.log("erro aqui");
			console.log(error.message);
			return res.status(400).send(error.message);
		}

		const userSelected = await User.findOne({ username: req.body.username });

		if (userSelected) {
			console.log("Username ja existe");
			return res.status(400).send("Username ja existe");
		}


		await User.findByIdAndUpdate(userId, { username: req.body.username });

		res.send("username reset successful");
	},
	changePassword: async (req, res) => {
		const userId = req._id;
		const { error } = validate.changePasswordValidates(req.body);
		if (error) return res.status(400).send(error.message);

		const userSelected = await User.findOne({ _id: userId });
		if (!userSelected) return res.status(400).send("User not found");

		const passwordMatch = bcrypt.compareSync(req.body.password, userSelected.password);
		if (!passwordMatch) return res.status(400).send("password incorrect");

		const newPasswordMatch = bcrypt.compareSync(req.body.newPassword, userSelected.password);
		if (newPasswordMatch) return res.status(400).send("This password is already being used by you");

		const passwordStrength = owasp.test(req.body.newPassword);
		if (!passwordStrength.strong) {
			const reasons = passwordStrength.errors.join(", ");
			return res.status(400).send(`Password does not meet the OWASP password strength requirements. Reasons: ${reasons}`);
		}

		userSelected.password = bcrypt.hashSync(req.body.newPassword);

		await userSelected.save();

		console.log("Password reset successful");

		res.status(200).send("Password reset successful");

	},
	sendCodeToNewEmail: async (req, res) => {
		const newEmail = req.body.newEmail;
		const userId = req._id;
		const user = await User.findOne({ _id: userId });
		if (!user) {
			return res.status(404).send("User not found");
		}

		const changeEmailCode = generateEmailCode();
		user.newEmail = req.body.newEmail;
		user.codeToChageEmail = changeEmailCode;
		user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
		await user.save();

		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: newEmail,
			subject: "Password Reset",
			html: `here your code ${changeEmailCode}`
		};

		mailer.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.log(error);
			} else {
				console.log("Email sent: " + info.response);
			}
		});

		res.send("code reset to email sent");
	},
	updateEmail: async (req, res) => {
		const code = req.body.codeToChangeEmail;
		const userId = req._id;
		const user = await User.findOne({ _id: userId });
		if (!user) {
			return res.status(404).send("User not found");
		}

		console.log(code);
		console.log(user.codeToChageEmail);

		if (user.codeToChageEmail !== code) {
			return res.status(401).send("Códigos de verificação inválidos");
		}
		console.log(user.newEmail);
		user.email = user.newEmail;
		console.log(user.email);
		user.newEmail = null;
		user.codeToChageEmail = null;

		await user.save();

		res.send("Email atualizado com sucesso");
	}
};

module.exports = forgotPasswordFunctions;