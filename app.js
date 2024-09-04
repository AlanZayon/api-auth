const express = require("express");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
// const cors = require("cors");
const userRouter = require("./routes/userRouter");
const adminRouter = require("./routes/adminRouter");
const mongoose = require("mongoose");
const admin = require("firebase-admin");


mongoose.connect(process.env.MONGO_CONNECTION_URL
).then(() => {
	console.log("Connected to the database");
})
	.catch((error) => {
		console.error("Error connecting to the database:", error);
	});

const serviceAccount = {
	type: process.env.FIREBASE_TYPE,
	project_id: process.env.FIREBASE_PROJECT_ID,
	private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
	private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
	client_email: process.env.FIREBASE_CLIENT_EMAIL,
	client_id: process.env.FIREBASE_CLIENT_ID,
	auth_uri: process.env.FIREBASE_AUTH_URI,
	token_uri: process.env.FIREBASE_TOKEN_URI,
	auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
	client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

// Inicialize o Firebase Admin SDK com as credenciais do serviço
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	storageBucket: process.env.STORAGE_BUCKET // Substitua pelo nome do seu bucket do Firebase Storage
});
const bucket = admin.storage().bucket();

const app = express();

// app.use(cors({
// 	origin: 'http://localhost:5173', // ou '*' para permitir todas as origens
// }));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));
app.set("views", path.join(__dirname, "../public/views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use("/user", userRouter);
app.use("/admin", adminRouter(bucket));

app.get("/", function (req, res) {
	res.json("Hello World");
});

app.get("/usuarios", function (req, res) {
	res.json("ususrios a mostra");
});



// Inicie o servidor
app.listen(process.env.PORT, () => {
	console.log(`Servidor rodando ${process.env.PORT}`);
});


