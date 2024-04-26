const express = require('express');
const router = express();

const { register_user, login_user } = require('../../controllers/userController');

router.get('/', (req, res) => {
    res.send('User Route');
});

router.post('/register', register_user);
router.post('/login', login_user);


module.exports = router;