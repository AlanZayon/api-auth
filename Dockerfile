# Usando uma imagem base do Node.js
FROM node:22

# Diretório de trabalho no container
WORKDIR /app

# Copiar o arquivo package.json e package-lock.json (ou yarn.lock) para o container
COPY package*.json ./

# Instalar as dependências do projeto
RUN npm install

# Copiar o restante dos arquivos do projeto para o container
COPY . .

# Expôr a porta que o app vai rodar
EXPOSE 3000

# Comando para rodar o app
CMD ["npm", "start"]
