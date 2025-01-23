const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/Models');

const AF2 = {
    // Gerar o segredo e QR Code quando o usuário habilitar o 2FA
    enable2FA: async (req, res) => {
        const userId = req._id;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        try {
            // Gerar o segredo de 2FA
            const secret = speakeasy.generateSecret();

            // Atualizar ou criar o usuário no banco de dados com o segredo
            await User.findOneAndUpdate(
                { _id: userId },
                {
                    secret: secret.base32,
                },
                { new: true, upsert: true }
            );

            // Gerar o QR Code
            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

            return res.json({
                qrCodeUrl
            });
        } catch (error) {
            console.error('Error enabling 2FA:', error);
            return res.status(500).json({ error: 'Failed to enable 2FA' });
        }
    },

    // Verificar o código inserido pelo usuário
    verify2FA: async (req, res) => {
        const token = req.body.token;
        const userId = req._id;
        if (!userId || !token) {
            console.log('User ID and token are required');
            return res.status(400).json({ error: 'User ID and token are required' });
        }
        const user = await User.findOne({ _id: userId });

        if (!user) {
            console.log('User not found');
            return res.status(400).json({ error: 'User not found' });
        }


        // Verificar o código gerado pelo Google Authenticator
        const isValid = speakeasy.totp.verify({
            secret: user.secret,
            encoding: 'base32',
            token,
        });

        if (isValid) {
            if (!user.enabled) {
                await User.findOneAndUpdate(
                    { _id: userId },
                    {
                        enabled: true,
                    },
                    { new: true, upsert: true }
                    
                );
                return res.json({ success: true });

            }else{
                await User.findOneAndUpdate(
                    { _id: userId },
                    {
                        isValid: true
                    },
                    { new: true, upsert: true }
                );
                return res.json({ success: true });
            }

        } else {
            console.log('Invalid token');
            return res.status(400).json({ error: 'Invalid token' });
        }
    },

     // Desativar o 2FA para o usuário
     disable2FA: async (req, res) => {
        const userId = req._id;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        try {
            // Remover o segredo de 2FA e marcar como desativado
            await User.findOneAndUpdate(
                { _id: userId },
                {
                    $unset: { secret: 1 },
                    enabled: false
                },
                { new: true }
            );

            return res.json({ success: true, message: '2FA has been disabled' });
        } catch (error) {
            console.error('Error disabling 2FA:', error);
            return res.status(500).json({ error: 'Failed to disable 2FA' });
        }
    }
}

module.exports = AF2;