const admin = require('firebase-admin');
const credentials = require('../ServiceAccount.json');

const dbconnection = async() => {
    try{
        const db = admin.initializeApp({
            credential: admin.credential.cert(credentials)
        });

        return db;
    } catch (error) {
        console.log(error);
    }
}

dbconnection();

/* const db = admin.initializeApp({
    credential: admin.credential.cert(credentials)
});  */


