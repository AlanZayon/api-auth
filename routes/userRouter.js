const express = require("express");
const router = express.Router();
const auth = require("../controllers/adminController");
const { userController } = require("../controllers/userController");
const resetUserDatasController = require("../controllers/resetUserDatasController");

router.get("/", userController.teste);

router.get("/redirect-home", userController.homePage);

router.get("/redirect-register", userController.registerPage);

router.get("/forgot-password-page", userController.forgotPasswordPage);

router.get("/verifyPage", userController.pageVerify);

router.get("/emailVerified", userController.emailVerified);

router.get("/LinkToVerifyToken",resetUserDatasController.verifyToken);

router.get("/reset-password-page", userController.resetPasswordPage);

router.get("/loginProvider", userController.loginProvider);

router.get("/check-firebase-user",auth.verificarToken,userController.loginWithFirebase);

router.get("/check-email",auth.checkEmail);

router.post("/update-profile", auth.updateProfile);

router.post("/register", userController.register);

router.post("/login", userController.login);

router.post("/logout", userController.logout);

router.post("/forgot-password", resetUserDatasController.sendEmail);

router.post("/reset-password", resetUserDatasController.resetPassword);

router.post("/SendEmailToVerify",resetUserDatasController.sendEmailToVerify);


module.exports = router;