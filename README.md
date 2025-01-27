# Authorization API

This is the backend for an authorization system that enables user login, registration, and authentication via email/password. The API is built with Node.js, Express, and MongoDB.

## Base URL
The API base URL is: [https://api-auth-6u2s.onrender.com](https://api-auth-6u2s.onrender.com)


## Endpoints

### 1. User Registration

- **URL:** `/user/register`
- **Method:** `POST`
- **Description:** `Registers a new user.`
  
#### Request:
```json
{
  "username": "exampleUser",
  "email": "user@example.com",
  "confirmEmail": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "dateOfBirth": "1990-01-01"
}
```
- Response with status 400:
```json
{
  "errors": [
    "E-mail already exists",
    "Username already exists",
    "E-mail and Username already exist",
    "Validation errors (if applicable)"
  ]
}

{
  "error": "Password does not meet the OWASP password strength requirements. Reasons: [list of reasons]"
}

{
  "error": "Error message"
}

```
- Response with status 200:
```json
{
  "firebaseToken": "customFirebaseTokenHere",
  "oldUserEmail": "updatedEmailHere"
}

```

### 2. User Login

- **URL:** `/user/login`
- **Method:** `POST`
- **Description:**  `Logs in using email and password.`

#### Request:
```json

{
  "email": "user@example.com",
  "password": "password123"
}

```

- Response with status 400:
```json
{
  "error": "Specific validation error message"
}

{
  "error": "email or password incorrect"
}

```
- Response with status 200:
```json
{
  "message": "logged",
  "verifyStatus": true/false, 
  "firebaseToken": "customFirebaseTokenHere"
}

```
```css
Authorization-token: Bearer {jwtTokenHere}
```
### 3. Token Verification

- **URL:** `/admin`
- **Method:** `GET`
- **Description:** `Verifies if the JWT or Firebase token is valid.`
- Request Headers:
```css
"Authorization": `Bearer ${token}`,
"X-Auth-Type": "JWT" or "Firebase"

```
#### Request:
- Response with status 200:
```json
{
  "_id": "user_id",
  "username": "exampleUser",
  "email": "user@example.com",
  "dateOfBirth": "1990-01-01T00:00:00.000Z"
  // Other user fields
}

```
- Response with status 404:

```json
{
  "error": "User not found"
}

```
- Response with status 500:

```json
{
  "error": "Error retrieving user"
}

```

- Response with status 500:

```json
{
  "error": "Unauthorized"
}

```

### 4. Login with Firebase

- **URL:** `user/check-firebase-user`
- **Method:** `GET`
- **Description:** `Checks if the user exists in the database and retrieves the user's verification status and 2FA status.`
- Request Headers:
```css
"Authorization": `Bearer ${token}`,
"X-Auth-Type": "Firebase"

```
#### Request:
- 200 OK (User exists):
```json
{
  "userExists": true,
  "verifyStatus": true,
  "enable2FA": false
}


```
- 200 OK (User does not exist):

```json
{
  "userExists": false
}
```

### 5. Logout

- **URL:** `user/logout`
- **Method:** `POST`
- **Description:** `Logs out the user by invalidating the token and adding it to the blacklist.`
- Request Headers:
```css
"Authorization": `Bearer ${token}`,
"X-Auth-Type": "JWT" or "Firebase"

```
#### Request:
```json
{
  "token": "<jwt-or-firebase-token>"
}

```
- 200 OK:
```json
{
  "message": "Successfully logged out."
}

```
- 500 Internal Server Error (In case of an unexpected error):

```json
{
  "error": "An error occurred while logging out."
}
```

## Technologies Used
- Node.js
- Express
- MongoDB
- JWT for authentication

  ## Installation

### To run locally:

1. **Clone the repository:**:

   ```bash
   git clone https://github.com/AlanZayon/api-auth.git
   ```

2. **Install dependencies:**:
   ```bash
   npm install
   ```
   
3. **Create a .env file with the following variables**:

 Do not share your .env file or its contents.
   ```env
   PORT=3000
   MONGO_CONNECTION_URL='mongodb+srv://your-username:your-password@cluster0.mongodb.net/test?retryWrites=true&w=majority'
   EMAIL_USER='your-email@gmail.com'
   EMAIL_PASSWORD='your-email-password'
   TOKEN_SECRET='your-secret-token'
   OAUTH_CLIENT_ID='your-oauth-client-id'
   OAUTH_CLIENT_SECRET='your-oauth-client-secret'
   OAUTH_REDIRECT_URL='your-redirect-url'
   OAUTH_REFRESH_TOKEN='your-refresh-token'
   STORAGE_BUCKET='your-storage-bucket'
   FIREBASE_TYPE='service_account'
   FIREBASE_PROJECT_ID='your-firebase-project-id'
   FIREBASE_PRIVATE_KEY_ID='your-firebase-private-key-id'
   FIREBASE_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----\n...-----END PRIVATE KEY-----\n'
   FIREBASE_CLIENT_EMAIL='your-client-email'
   FIREBASE_CLIENT_ID='your-client-id'
   FIREBASE_AUTH_URI='https://accounts.google.com/o/oauth2/auth'
   FIREBASE_TOKEN_URI='https://oauth2.googleapis.com/token'
   FIREBASE_AUTH_PROVIDER_X509_CERT_URL='https://www.googleapis.com/oauth2/v1/certs'
   FIREBASE_CLIENT_X509_CERT_URL='https://www.googleapis.com/robot/v1/metadata/x509/...'
   VERIFY_URL_REDIRECT="<your-front-end-url>"

   ```
   
5. **Start the server:**:
   ```bash
    npm run start
   ```
   The API will be available at http://localhost:3000.
