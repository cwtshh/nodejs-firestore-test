const express = require('express');
const router = express();

router.get('/', (req, res) => {
    res.send('Hello World');
});

router.use('/user', require('./user_routes/userRoutes'));
router.use('/group', require('./group_routes/groupRoutes'));
router.use('/archive', require('./archive_routes/archiveRoutes'));

module.exports = router;