const express = require('express');
const { check } = require ('express-validator');

const userController = require('../controllers/users-controller');
const router = express.Router();
const fileUpload = require('../middleware/file-upload');

router.get('/', userController.getAllUser);

router.post('/signup',
            fileUpload.single('image'),
            [check('name').not().isEmpty(),
             check('email').normalizeEmail().isEmail(),
             check('password').isLength({min:6})],
            userController.userSignUp);

router.post('/login', 
            [check('email').normalizeEmail().isEmail(),
             check('password').isLength({min:6})],
            userController.userLogIn);

module.exports = router;  