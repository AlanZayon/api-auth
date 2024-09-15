# API de Autorização

Este é o backend de um sistema de autorização, que permite login, registro e autenticação de usuários atravé do e-mail/senha. A API é construída com Node.js, Express e MongoDB.

## Base URL
A URL base da API é: https://api-auth-fg73.vercel.app/


## Endpoints

### 1. Registro de Usuário

- **URL:** `/user/register`
- **Método:** `POST`
- **Descrição:** Registra um novo usuário.
  
#### Request:
```json
{
  "username": "exemploUser",
  "email": "usuario@exemplo.com",
  "confirmEmail": "usuario@exemplo.com",
  "password": "senha123",
  "confirmPassword": "senha123",
  "dateOfBirth": "1990-01-01"
}
```
- Resposta com status 400
```json
{
  "errors": [
    "E-mail already exists",
    "Username already exists",
    "E-mail and Username already exists",
    "Validation errors (se aplicável)"
  ]
}

{
  "error": "Password does not meet the OWASP password strength requirements. Reasons: [lista dos motivos]"
}

{
  "error": "Mensagem do erro ocorrido"
}
```
- Resposta com status 200
```json
{
  "firebaseToken": "tokenFirebasePersonalizadoAqui",
  "oldUserEmail": "newEmailAqui"
}
```

### 1. Login de Usuario

- **URL:** `/user/login`
- **Método:** `POST`
- **Descrição:**Realiza login com e-mail e senha.

#### Request:
```json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

- Resposta com status 400
```json
{
  "error": "Mensagem de erro específica da validação"
}

{
  "error": "email or password incorrect"
}
```
- Resposta com status 200
```json
{
  "message": "logged",
  "verifyStatus": true/false, 
  "firebaseToken": "tokenFirebasePersonalizadoAqui"
}
```
```css
Authorization-token: Bearer {jwtTokenAqui}
```
### 1. Verificação de Token

- **URL:** `/admin`
- **Método:** `GET`
- **Descrição:**Verifica se o token JWT ou Firebase é válido.
```css
"Authorization": `Bearer ${token}`,
"X-Auth-Type": "JWT" ou "Firebase"
```
#### Request:
- Resposta com status 200
```json
{
  "_id": "id_do_usuario",
  "username": "exemploUser",
  "email": "usuario@exemplo.com",
  "dateOfBirth": "1990-01-01T00:00:00.000Z"
  // Outros campos do usuário
}
```
- Resposta com status 404

```json
{
  "error": "Usuário não encontrado"
}
```
- Resposta com status 500

```json
{
  "error": "Erro ao buscar usuário"
}
```

- Resposta com status 500

```json
{
  "error": "Unauthorized"
}
```

## Tecnologias Utilizadas
- Node.js
- Express
- MongoDB
- JWT para autenticação

  ## Instalação

### Para rodar localmente:

1. **Clone o repositório**:

   ```bash
   git clone https://github.com/AlanZayon/api-auth.git
   ```

2. **Instale as dependências:**:
   ```bash
   git clone https://github.com/AlanZayon/api-auth.git
   ```
   
3. **Crie um arquivo .env com as seguintes variáveis:**:
   ```env
    PORT=3000
    MONGO_CONNECTION_URL='mongodb+srv://seu-usuario:sua-senha@cluster0.mongodb.net/test?retryWrites=true&w=majority'
    EMAIL_USER='seu-email@gmail.com'
    EMAIL_PASSWORD='sua-senha-de-email'
    TOKEN_SECRET='seu-token-secreto'
    OAUTH_CLIENT_ID='seu-oauth-client-id'
    OAUTH_CLIENT_SECRET='seu-oauth-client-secret'
    OAUTH_REDIRECT_URL='sua-url-de-redirect'
    OAUTH_REFRESH_TOKEN='seu-refresh-token'
    STORAGE_BUCKET='seu-storage-bucket'
    FIREBASE_TYPE='service_account'
    FIREBASE_PROJECT_ID='seu-firebase-project-id'
    FIREBASE_PRIVATE_KEY_ID='sua-firebase-private-key-id'
    FIREBASE_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----\n...-----END PRIVATE KEY-----\n'
    FIREBASE_CLIENT_EMAIL='seu-client-email'
    FIREBASE_CLIENT_ID='seu-client-id'
    FIREBASE_AUTH_URI='https://accounts.google.com/o/oauth2/auth'
    FIREBASE_TOKEN_URI='https://oauth2.googleapis.com/token'
    FIREBASE_AUTH_PROVIDER_X509_CERT_URL='https://www.googleapis.com/oauth2/v1/certs'
    FIREBASE_CLIENT_X509_CERT_URL='https://www.googleapis.com/robot/v1/metadata/x509/...'
   ```
   
4. **Rode o servidor:**:
   ```bash
    npm start_server
   ```
   A API estará disponível em http://localhost:3000.
