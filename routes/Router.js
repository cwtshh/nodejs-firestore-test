const express = require('express');
const router = express();

router.get('/', (req, res) => {
    res.send('Hello World');
});

router.use('/user', require('./user_routes/userRoutes'));

module.exports = router;