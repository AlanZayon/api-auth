const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
	profileImage: { type: String, url: true },
	username: { type: String, required: true, minlength: 5, maxlength: 50 },
	email: { type: String, required: true, minlength: 3, maxlength: 50 },
	confirmEmail: { type: String, minlength: 3, maxlength: 50 },
	password: { type: String, required: true, minlength: 3, maxlength: 100 },
	confirmPassword: { type: String, minlength: 3, maxlength: 100 },
	dateOfBirth: {
		type: String,
		required: true,
		validate: {
			validator: function (value) {
				// Calcula a idade com base na data de nascimento
				const today = new Date();
				const birthDate = new Date(value);
				let age = today.getFullYear() - birthDate.getFullYear();
				const monthDiff = today.getMonth() - birthDate.getMonth();
				if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
					age--;
				}
				// Verifica se a idade é maior ou igual a 18 anos
				if (age >= 18) {
					return true; // Retorna true se a validação for bem-sucedida
				} else {
					// Se a validação falhar, lança um erro com a mensagem personalizada
					throw new Error("Usuário deve ter pelo menos 18 anos de idade");
				}
			},
			message: "Usuário deve ser maior de 18 anos"
		}
	},
	tokenVerify: { type: String },
	verified: { type: Boolean, required: true, default: false },
	createAt: { type: Date, default: Date.now },
	resetToken: { type: String },
	resetTokenExpiration: { type: Date },
	codeToChageEmail: { type: String },
	newEmail: { type: String },
});

module.exports = mongoose.model("User", userSchema);