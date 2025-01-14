const multer = require("multer");

// Configuração do multer para lidar com upload de arquivos
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 10 * 1024 * 1024 // Limite de tamanho do arquivo (10 MB)
	}
});

module.exports = upload;
