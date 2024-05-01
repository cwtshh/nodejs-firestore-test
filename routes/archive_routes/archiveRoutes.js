const express = require('express');
const router = express();
const multer = require('multer');

const { upload_file, run_python_code, run_python_code_w_tests } = require('../../controllers/archiveController');

router.get('/', (req, res) => {
    res.send('Archive Route');
});
const upload = multer({ storage: multer.memoryStorage() });
const python_upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('filename'), upload_file);
router.post('/run-code', python_upload.single('filename'), run_python_code);
router.post('/run-code/tests', python_upload.single('filename'), run_python_code_w_tests);

module.exports = router;