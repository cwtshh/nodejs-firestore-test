const express = require('express');
const router = express();

const { get_groups, create_group, add_student } = require('../../controllers/groupController');

router.get('/', (req, res) => {
    res.send('Group Route');
});

router.get('/getgroups', get_groups);
router.post('/create', create_group);
router.patch('/addstudent', add_student);


module.exports = router;