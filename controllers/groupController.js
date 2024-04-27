const admin = require('firebase-admin');
const db = admin.firestore();


const get_groups = async(req, res) => {
    const groups = await db.collection('groups').get();

    if(groups.empty) {
        res.status(404).json({
            message: 'No groups found'
        });
        return;
    }

    const groups_list = [];
    groups.forEach(doc => {
        groups_list.push(doc.data());
    });
    res.status(200).json(groups_list);
};

const create_group = async(req, res) => {
    const { name, description, turma } = req.body;

    const group = await db.collection('groups').where('name', '==', name).get();
    if(group.docs.length > 0) {
        res.status(400).json({
            message: 'Group already exists'
        });
        return;
    }

    const new_group = {
        name,
        description,
        turma,
        created_at: new Date().toISOString(),
        students: []
    };

    try {
        await db.collection('groups').doc(new_group.name).set(new_group);
        res.status(200).json({
            message: 'Group created successfully'
        });
    } catch (error) {
        res.send(`error`);
        console.log(error);
    }
};

const add_student = async(req, res) => {
    const { group_name, student_uuid } = req.body;

    const group = await db.collection('groups').doc(group_name).get();
    if(!group.exists) {
        res.status(404).json({
            message: 'Group not found'
        });
        return;
    }
    const group_data = group.data();

    const student = await db.collection('users').doc(student_uuid).get();
    if(!student.exists) {
        res.status(404).json({
            message: 'Student not found'
        });
        return;
    }
    const student_data = student.data();

    if(group_data.students.includes(student_data.uuid)) {
        res.status(400).json({
            message: 'Student already in group'
        });
        return;
    }
    group_data.students.push(student_data.uuid);

    try {
        await db.collection('groups').doc(group_name).set(group_data);
        res.status(200).json({
            message: 'Student added to group'
        });
    } catch (error) {
        res.send(`error`);
        console.log(error);
    }
};

module.exports = {
    get_groups,
    create_group,
    add_student
};
