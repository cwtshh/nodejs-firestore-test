const secret = process.env.SECRET;

const admin = require('firebase-admin');
const db = admin.firestore();
const uuid = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generate_token = (id) => {
    return jwt.sign({ id }, secret, {
        expiresIn: '7d'
    });
};
const validate_token = (token) => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
};
const register_user = async(req, res) => {
    const { name, email, password, matricula } = req.body;

    const user = await db.collection('users').where('email', '==', email).get();
    if(user.docs.length > 0) {
        res.status(400).json({
            message: 'User already exists'
        });
        return;
    }
    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(password, salt);
    const new_user = {
        uuid: uuid.v4(),
        name,
        email,
        password: password_hash,
        matricula,
        created_at: new Date().toISOString()
    };
    try {
        await db.collection('users').doc(new_user.uuid).set(new_user);
        res.status(200).json({
            message: 'User registered successfully',
            token: generate_token(new_user.uuid),
            id: new_user.uuid
        });	
    } catch (error) {
        res.send(`error`);
        console.log(error);
    }
};

const login_user = async(req, res) => {
    const { matricula, password } = req.body;
    const user = await db.collection('users').where('matricula', '==', matricula).get();
    if(user.docs.length === 0) {
        res.status(400).json({
            message: 'User not found'
        });
        return;
    }
    const user_data = user.docs[0].data();
    const is_password_valid = await bcrypt.compare(password, user_data.password);
    if(!is_password_valid) {
        res.status(400).json({
            message: 'Invalid password'
        });
        return;
    }
    res.status(200).json({
        message: 'User logged in successfully',
        token: generate_token(user_data.uuid),
        id: user_data.uuid
    });
}

module.exports = {
    register_user,
    login_user
}