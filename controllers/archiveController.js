const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require('firebase/storage');
const { initializeApp } = require('firebase/app');
const { exec } = require('child_process');
const fs = require('fs');
const { stdout, stderr } = require('process');
const path = require('path');
 
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

const add_test_cases = (main_code, test_cases) => {
    const modified_code = `
${main_code}
def main():
    ${test_cases}

if __name__ == '__main__':
    main()
`

    return modified_code;
};

const run_python_code_w_tests = async(req, res) => {
    const file = req.file; // recebe o arquivo em form-data
    if(!file) { // verifica se o arquivo foi enviado
        return res.status(400).json({
            message: 'No file uploaded'
        });
    }
    const pythonCode = fs.readFileSync(req.file.path, 'utf8'); // lê o arquivo
    const test_cases = `
        usuario = User('Joao', 20)
        assert usuario.nome == 'Joao'
        assert usuario.idade == 20

        usuario1 = User('Maria', 25)
        assert usuario1.nome == 'Maria'
        assert usuario1.idade == 25

        assert usuario.hello() == 'Ola, Joao!'
        assert usuario1.hello() == 'Ola, Maria!'
    `;

    const modified_code = add_test_cases(pythonCode, test_cases);
    const new_file_path = path.join('uploads/', 'modified_' + req.file.originalname);
    fs.writeFileSync(new_file_path, modified_code);

    exec(`python ${new_file_path}`, (error, stdout, stderr) => {
        if(error) {
            console.log(`error: ${error.message}`);
            res.status(400).json({
                message: 'Code execution error',
                error: error.message
            });
            return;
        }
        console.log(`Saída: ${stdout}`);
        res.send({
            message: 'Code executed successfully',
            output: stdout
        });
        fs.unlinkSync(new_file_path);
        fs.unlinkSync(req.file.path);
    })
}


const run_python_code = async(req, res) => {
    const file = req.file; // recebe o arquivo em form-data
    if(!file) { // verifica se o arquivo foi enviado
        return res.status(400).json({
            message: 'No file uploaded'
        });
    }
    const pythonCode = fs.readFileSync(file.path, 'utf8'); // lê o arquivo
    /* console.log(pythonCode) // loga o código */
    exec(`python ${file.path}`, (error, stdout, stderr) => { // executa o código python
        if(error) { // verifica se houve erro
            console.log(`error: ${error.message}`);
            res.status(400).json({
                message: 'Code execution error'
            });
            return;
        }
        console.log(`Saída: ${stdout}`); // loga a saída
        res.send({
            message: 'Code executed successfully',
            output: stdout
        }); // envia a saída
        fs.unlinkSync(file.path); // deleta o arquivo
    });
};


module.exports = {
    upload_file,
    run_python_code,
    run_python_code_w_tests
};