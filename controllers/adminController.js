/* eslint-disable indent */
const jwt = require("jsonwebtoken");
const { blacklist } = require("../controllers/userController");
const path = require("path");
const User = require("../models/Models");
const firebaseAdmin = require("firebase-admin");

const admin = {
  verificarToken: async function (req, res, next) {
    const authHeader = req.headers["authorization"];
    const authType = req.headers["x-auth-type"]; // Header customizado para identificar o tipo de autenticação
    
    if (!authHeader || !authType) {
      return res.status(401).json({ message: "Token ou tipo de autenticação não fornecido" });
    }
  
    // Remove o prefixo "Bearer " do token
    const token = authHeader.split(" ")[1];
  
    let decodedToken;
    
    // Verifica o tipo de autenticação
    if (authType === "Firebase") {
      try {
        decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        const userSelected = await User.findOne({ _id: decodedToken.uid});
        if (!userSelected) return res.status(400).send("user not found");
        req._id = decodedToken.uid; // Define o _id no req com o UID do Firebase
        next();
      } catch (error) {
        return res.status(403).json({ message: "Token do Firebase inválido" });
      }
    } else if (authType === "JWT") {
      try {
        if (blacklist.has(token)) return res.sendStatus(403); // Token inválido
        decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        req._id = decodedToken._id;
        next();
      } catch (error) {
        return res.status(403).json({ message: "Token JWT inválido" });
      }
    } else {
      return res.status(401).json({ message: "Tipo de autenticação inválido" });
    }
  },
  uploadImage: async function (req, res, bucket) {
    try {
      const userId = req._id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, message: "Nenhum arquivo enviado" });
      }

      // Upload do arquivo para o Firebase Storage
      const fileName = `${userId}/${Date.now() + path.extname(file.originalname)}`;
      const fileUpload = bucket.file(fileName);

      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype
        }
      });

      stream.on("error", (error) => {
        res.status(500).json({ success: false, message: "Erro ao fazer upload de imagem" });
      });

      stream.on("finish", async () => {

        // Atualiza o caminho da imagem de perfil no documento do usuário
        try {
          // URL do arquivo no Firebase Storage
          // Gerar uma URL assinada válida por 7 dias
          const options = {
            version: "v4",
            action: "read",
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 dias
          };

          const [url] = await fileUpload.getSignedUrl(options);
          await User.findByIdAndUpdate(userId, { profileImage: url });
          res.json({ success: true, message: "Upload de imagem realizado com sucesso" });
        } catch (updateError) {
          res.status(500).json({ success: false, message: "Erro ao atualizar o perfil do usuário" });
        }

      });

      stream.end(file.buffer);
    } catch (err) {
      res.status(500).json({ success: false, message: "Erro ao fazer upload de imagem" });
    }
  },
  checkEmail:  async (req, res) => {
    const email = req.query.email;
  
    try {
      const userRecord = await firebaseAdmin.auth().getUserByEmail(email);
      res.json({ userExists: true, signInMethods: userRecord.providerData.map(provider => provider.providerId) });
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        res.json({ userExists: false });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },
  updateProfile: async (req, res) => {
    const { uid, customClaims } = req.body;
  
    try {
      await firebaseAdmin.auth().setCustomUserClaims(uid, customClaims);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};


module.exports = admin;