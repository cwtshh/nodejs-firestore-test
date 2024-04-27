const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require('firebase/storage');
const { initializeApp } = require('firebase/app');
const { exec } = require('child_process');
const fs = require('fs');
 
const firebaseConfig = { // configuração do firebase
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECTID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MESSAGINGSENDERID,
    appId: process.env.APPID
};
initializeApp(firebaseConfig); // inicializa o firebase
const storage = getStorage(); // inicializa o storage

const upload_file = async(req, res) => {
    try{
        const file = req.file; // recebe o arquivo em form-data
        if(!file) { // verifica se o arquivo foi enviado
            return res.status(400).json({
                message: 'No file uploaded'
            });
        }
        const storageRef = ref(storage, `files/${file.originalname} - ${new Date().toISOString()}`); // cria a referência para o arquivo
        const metaData = { // metadados do arquivo
            contentType: file.mimetype
        };
        const snapshot = await uploadBytesResumable(storageRef, file.buffer, metaData); // faz o upload do arquivo
        const downloadURL = await getDownloadURL(snapshot.ref); // pega a URL do arquivo
        console.log('File uploaded to', downloadURL); // loga a URL do arquivo
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
    const file =  req.file; // recebe o arquivo em form-data
    if(!file) { // verifica se o arquivo foi enviado
        return res.status(400).json({
            message: 'No file uploaded'
        });
    }
    const pythonCode = fs.readFileSync(file.path, 'utf8'); // lê o arquivo
    console.log(pythonCode) // loga o código
    exec(`python ${file.path}`, (error, stdout, stderr) => { // executa o código python
        if(error) { // verifica se houve erro
            console.log(`error: ${error.message}`);
            res.status(400).json({
                message: 'Error running python code'
            });
            return;
        }
        console.log(`Saída: ${stdout}`); // loga a saída
        res.send(stdout); // envia a saída
        fs.unlinkSync(file.path); // deleta o arquivo
    });
};

module.exports = {
    upload_file,
    run_python_code
};