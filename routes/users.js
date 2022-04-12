const express = require('express');
const { User } = require('../models/user');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash');

    if (!userList) {
        res.status(500).json({success: false})
    }
    res.send(userList)
})

// get single user by its id
router.get(`/:id`, async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
        res.status(500).json({success: false});
    }
    res.send(user);
})

// register user
router.post(`/`, async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        isAdmin: req.body.isAdmin
    })

    user = await user.save();

    if (!user) {
        return res.status(500).send('The user cannot be created');
    }
    
    res.send(user);
})

/*
{
    "name": "Sameed",
    "email": "ahsan@gmail.com",
    "password": "sameed123"
}
*/

router.post(`/register`, async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        isAdmin: req.body.isAdmin
    })

    user = await user.save();

    if (!user) {
        return res.status(500).send('The user cannot be created');
    }
    
    res.send(user);
})

/*
{
    "email": "ahsan@gmail.com",
    "password": "ahsan123"
}
*/

// login user
router.post('/login', async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    const secret = process.env.secret;

    if (!user) {
        return res.status(400).send('The user not found');
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret
        )
        res.status(200).send({user: user.email, token: token, name: user.name, id: user.id});
    } else {
        res.status(404).send('Password is wrong!');
    }
})

// delete user by its id
router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
        if (user) {
            return res.status(200).json({success: true, message: 'the user is deleted'});
        } else {
            return res.status(404).json({success: true, message: 'user not found'});
        }
    }).catch(err => {
        return res.status(500).json({success: false, message: err});
    })
})

/*
// get total count of users in the table
router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments((count) => count);

    if (!userCount) {
        res.status(500).json({success: false})
    }
    res.send(userCount)
})
*/

module.exports = router;