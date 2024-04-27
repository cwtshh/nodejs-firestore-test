const multer = require('multer');
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require('firebase/storage');
const { initializeApp } = require('firebase/app');
const { exec } = require('child_process');
const fs = require('fs');

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECTID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MESSAGINGSENDERID,
    appId: process.env.APPID
};
initializeApp(firebaseConfig);
const storage = getStorage();

const upload_file = async(req, res) => {
    try{
        const file = req.file;
        const storageRef = ref(storage, `files/${file.originalname} - ${new Date().toISOString()}`);
        const metaData = {
            contentType: file.mimetype
        };
        const snapshot = await uploadBytesResumable(storageRef, file.buffer, metaData);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('File uploaded to', downloadURL);
        res.status(200).json({
            message: 'File uploaded successfully',
            url: downloadURL,
            name: file.originalname,
            size: file.size,
            type: file.mimetype
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Error uploading file'
        });
    }
};

const run_python_code = async(req, res) => {
    const file =  req.file;
    if(!file) {
        return res.status(400).json({
            message: 'No file uploaded'
        });
    }
    const pythonCode = fs.readFileSync(file.path, 'utf8');
    console.log(pythonCode)
    exec(`python ${file.path}`, (error, stdout, stderr) => {
        if(error) {
            console.log(`error: ${error.message}`);
            res.status(400).json({
                message: 'Error running python code'
            });
            return;
        }
        console.log(`Saída: ${stdout}`);
        res.send(stdout);
    });
};

module.exports = {
    upload_file,
    run_python_code
};