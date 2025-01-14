const express = require("express");
const router = express.Router();
const auth = require("../controllers/adminController");
const User = require("../models/Models");
const upload = require("../config/multerConfig");
const resetUserDatasController = require("../controllers/resetUserDatasController");


module.exports = (bucket) => {
	router.get("/", auth.verificarToken,async (req, res) => {
		try {
			const user = await User.findById(req._id);
			if (!user) {
				return res.status(404).send("Usuário não encontrado");
			}
			res.json(user);
		} catch (err) {
			res.status(500).send("Erro ao buscar usuário");
		}
	});
	
	router.get("/user", auth.verificarToken, async (req, res) => {
		try {
			const user = await User.findById(req._id);
			if (!user) {
				return res.status(404).send("Usuário não encontrado");
			}
			res.json(user);
		} catch (err) {
			res.status(500).send("Erro ao buscar usuário");
		}
	});
	
	router.post("/upload",auth.verificarToken,upload.single("profileImage"),(req,res) => auth.uploadImage(req,res,bucket));

	router.post("/resetUsername",auth.verificarToken,resetUserDatasController.resetUsername);

	router.post("/resetPassword",auth.verificarToken,resetUserDatasController.changePassword);

	router.put("/code", auth.verificarToken,resetUserDatasController.sendCodeToNewEmail);

	router.put("/verificationCode", auth.verificarToken,resetUserDatasController.updateEmail);



	return router;
};