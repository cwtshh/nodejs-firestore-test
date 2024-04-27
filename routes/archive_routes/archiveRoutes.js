const express = require('express');
const router = express();
const multer = require('multer');

const { upload_file } = require('../../controllers/archiveController');

router.get('/', (req, res) => {
    res.send('Archive Route');
});
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('filename'), upload_file);

module.exports = router;