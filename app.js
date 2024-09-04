const express = require("express");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const cors = require("cors");
const userRouter = require("./routes/userRouter");
const adminRouter = require("./routes/adminRouter");
const mongoose = require("mongoose");
const serviceAccount = require("./config/site-kong-firebase-adminsdk-vessm-502be374ec.json");
const admin = require("firebase-admin");


mongoose.connect(process.env.MONGO_CONNECTION_URL
).then(() => {
	console.log("Connected to the database");
})
	.catch((error) => {
		console.error("Error connecting to the database:", error);
	});

// Inicialize o Firebase Admin SDK com as credenciais do serviço
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	storageBucket: process.env.STORAGE_BUCKET // Substitua pelo nome do seu bucket do Firebase Storage
});
const bucket = admin.storage().bucket();

const app = express();

app.use(cors({
	origin: "*",
	exposedHeaders: ["Authorization-token"],
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));
app.set("views", path.join(__dirname, "../public/views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use("/user", userRouter);
app.use("/admin", adminRouter(bucket));

app.get("/", function (req, res) {
	res.render(path.join(__dirname, "../public/views/index"));
});


// Inicie o servidor
app.listen(process.env.PORT, () => {
	console.log(`Servidor rodando ${process.env.PORT}`);
});


