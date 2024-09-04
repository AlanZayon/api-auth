/* eslint-disable indent */
/* eslint-disable no-undef */
const User = require("../models/Models");
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validate = require("../config/valdiates");
const owasp = require("owasp-password-strength-test");


const blacklist = new Set();


const userController = {
    teste: function (req, res) {
        res.json("teste");
    },
    homePage: function (req, res) {
        res.render("home");
    },
    registerPage: function (req, res) {
        res.render("cadastro");
    },
    forgotPasswordPage: function (req, res) {
        const token = "waitingToken";
        res.render("forgotPassword", { token });
    },
    resetPasswordPage: (req, res) => {
        const token = req.query.token;
        // Render the password reset page with a form to enter the new password
        res.render("forgotPassword", { token });
    },
    pageVerify: (req, res) => {
        res.render("verifyPage");
    },
    emailVerified: (req, res) => {
        res.render("emailVerified");
    },
    loginProvider: (req, res) => {
        res.render("loginProvider");
    },
    register: async function (req, res) {

        let errors = [];
        console.log(errors);

        const { error } = validate.registerValidates(req.body);
        if (error) {
            errors.push(error.message);
        }

        const userSelected = await User.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] });

        if (userSelected) {
            if (userSelected.email === req.body.email && userSelected.username === req.body.username) {
                errors.push("E-mail and Username already exists");
            } else if (userSelected.email === req.body.email) {
                errors.push("E-mail already exists");
            } else {
                errors.push("Username already exists");
            }
        }

        if (errors.length > 0) {

            console.log(errors);

            return res.status(400).json({ errors });
        }
        
        const passwordStrength = owasp.test(req.body.password);
        if (!passwordStrength.strong) {
            const reasons = passwordStrength.errors.join(", ");
            return res.status(400).send(`Password does not meet the OWASP password strength requirements. Reasons: ${reasons}`);
        }

        const salt = bcrypt.genSaltSync(10);

        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, salt),
            dateOfBirth: req.body.dateOfBirth
        });
        try {
            const savedUser = await user.save();

            // Verifique o token do Google e obtenha o UID do usuário do Google
            const decodedToken = await admin.auth().verifyIdToken(req.body.firebaseUid);
            const decodedTokenEmail = decodedToken.email;

            const newEmail = `${decodedToken.uid}alanbobao564@gmail.com`;

            await admin.auth().updateUser(decodedToken.uid, {
                email: newEmail,
            });

            // Crie um novo UID personalizado
            const newUid = savedUser._id.toString();

            // Crie um novo usuário no Firebase usando o UID personalizado
            const newUser = await admin.auth().createUser({
                uid: newUid,
                email: decodedTokenEmail,
                displayName: decodedToken.name,
                photoURL: decodedToken.picture
            });

            const customToken = await admin.auth().createCustomToken(newUser.uid);
            // Deletar o usuário antigo, se o oldUid foi fornecido

            res.json({ firebaseToken: customToken, oldUserEmail: newEmail });

        } catch (error) {
            res.status(400).send(error.message);
        }

    },
    login: async function (req, res) {


        const { error } = validate.loginValidates(req.body);
        if (error) { return res.status(400).send(error.message); }

        const userSelected = await User.findOne({ email: req.body.email });

        if (!userSelected) return res.status(400).send("email or password incorrect");

        const emailAndPasswordMatch = bcrypt.compareSync(req.body.password, userSelected.password);

        if (!emailAndPasswordMatch) return res.status(400).send("email or password incorrect");

        const token = jwt.sign({ _id: userSelected._id, email: userSelected.email }, process.env.TOKEN_SECRET, { expiresIn: "24h" });

        const firebaseToken = await admin.auth().createCustomToken(userSelected._id.toString());
        console.log("token do firebase: ",firebaseToken);

        res.header("Authorization-token", `Bearer ${token}`).send({ message: "logged", verifyStatus: userSelected.verified, firebaseToken: firebaseToken });

    },
    loginWithFirebase: async (req, res) => {
        const userId = req._id;
        const user = await User.findOne({ _id: userId });
        if (user) {
            res.json({ userExists: true, verifyStatus: user.verified });
        } else {
            res.json({ userExists: false });
        }
    },
    logout: async function (req, res) {
        const { token } = req.body;
        // Adicionar o token à lista negra
        blacklist.add(token);
        res.send("Logout realizado com sucesso.");
    }
};

module.exports = {
    userController: userController,
    blacklist: blacklist
};



