require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const admin = require('firebase-admin');
const credentials = require('./ServiceAccount.json');

admin.initializeApp({
    credential: admin.credential.cert(credentials)
});
const db = admin.firestore();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = require('./routes/Router');
app.use(router);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
