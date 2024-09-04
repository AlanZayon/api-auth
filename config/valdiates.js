const Joi = require("joi");

const registerValidates = (data) => {
	const schema = Joi.object({
		profileImage: Joi.string().uri(),
		username: Joi.string().required().min(5).max(50).regex(/^\S*$/).messages({
			"string.empty": "O nome de usuário é obrigatório.",
			"string.min": "O nome de usuário deve ter pelo menos 5 caracteres.",
			"string.max": "O nome de usuário deve ter no máximo 50 caracteres.",
			"string.pattern.base": "O nome de usuário não deve conter espaços.",
		}),
		email: Joi.string().required().email().min(3).max(50),
		confirmEmail: Joi.string().required().min(3).max(50).valid(Joi.ref("email")).messages({
			"any.only": "Emails do not match"
		}),
		password: Joi.string().required().min(10).max(100),
		confirmPassword: Joi.string().required().min(10).max(100).valid(Joi.ref("password")).messages({
			"any.only": "Passwords do not match"
		}),
		dateOfBirth: Joi.date().required().max("now").raw().custom((value, helpers) => {
			// Validador personalizado para a idade
			const today = new Date();
			const birthDate = new Date(value);
			let age = today.getFullYear() - birthDate.getFullYear();
			const monthDiff = today.getMonth() - birthDate.getMonth();

			if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
				age--; // Se a data atual for anterior ao aniversário deste ano, subtrai 1 da idade
			}

			// Verifica se a idade é maior ou igual a 18 anos
			if (age >= 18) {
				return value; // Retorna o valor se a validação for bem-sucedida
			} else {
				return helpers.message("Usuário deve ter pelo menos 18 anos de idade"); // Retorna a mensagem de erro
			}
		}),
		// eslint-disable-next-line quotes
		firebaseUid: Joi.string().allow('', null).optional()	
	});

	return schema.validate(data);
};

const loginValidates = (data) => {
	const schema = Joi.object({
		email: Joi.string().required().email().min(3).max(50),
		password: Joi.string().required().min(3).max(100),
	});

	return schema.validate(data);
};

const tokenValidates = (data) => {
	const schema = Joi.object({
		resetToken: Joi.string(),
		newPassword: Joi.string().required().min(6).max(100),
		confirmNewPassword: Joi.string().required().min(3).max(100).valid(Joi.ref("newPassword")).messages({
			"any.only": "Passwords do not match"
		})
	});

	return schema.validate(data);
};

const changePasswordValidates = (data) => {
	const schema = Joi.object({
		password: Joi.string().required().min(3).max(100),
		newPassword: Joi.string().required().min(3).max(100),
		confirmNewPassword: Joi.string().required().min(3).max(100).valid(Joi.ref("newPassword")).messages({
			"any.only": "Passwords do not match"
		})
	});

	return schema.validate(data);
};

const codeValidates = (data) => {
	const schema = Joi.object({
		newEmail: Joi.string().required().email().min(6).max(100)
	});

	return schema.validate(data);
};

const usernameValidates = (data) => {
	const schema = Joi.object({
		username: Joi.string().required().min(5).max(50).regex(/^\S*$/).messages({
			"string.empty": "O nome de usuário é obrigatório.",
			"string.min": "O nome de usuário deve ter pelo menos 5 caracteres.",
			"string.max": "O nome de usuário deve ter no máximo 50 caracteres.",
			"string.pattern.base": "O nome de usuário não deve conter espaços.",
		}),
	});

	return schema.validate(data);
};

module.exports.loginValidates = loginValidates;
module.exports.registerValidates = registerValidates;
module.exports.tokenValidates = tokenValidates;
module.exports.changePasswordValidates = changePasswordValidates;
module.exports.codeValidates = codeValidates;
module.exports.usernameValidates = usernameValidates;