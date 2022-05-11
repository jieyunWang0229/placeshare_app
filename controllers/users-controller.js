const { v4:uuid } = require('uuid');
const req = require('express/lib/request');
const path = require('path');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const HttpError = require('../models/http-error');
const User = require('../models/user');




const getAllUser =async (req, res, next) =>{

    let users;
    try{
        users = await User.find({},'-password');
    }catch(err){
        const error = new HttpError('Fetch user failed', 500);
        return next(error);
    }

    res.json( {users :  users.map(user => user.toObject({ getters: true }))});

};

const userSignUp =async (req, res, next) =>{
  
    const { name, email, password } = req.body;
    const error = validationResult(req);
    if( !error.isEmpty()){ 
        const error = new HttpError('Invalid inputs, please check your data', 422);
        return next(error);
    }
    let existedUser;
    try{
        existedUser = await User.findOne({ email : email});
    }catch(err){
        const error = new HttpError('SignUp failed', 500);
        return next(error);
    }

    if(existedUser){
        const error = new HttpError('Email already existed.', 422);
        return next(error);
    }

    let hashedPassword;
    try{
       hashedPassword = await bcrypt.hash(password,12);
    }catch(err){
        const error = new HttpError('Could not create user,please try again', 500);
        return next(error);
    }
   

    const createUser = new User({
        name,
        email,
        image: req.file.path,
        password: hashedPassword,
        places:[]
    });
    try{
       await createUser.save();
    }catch(err){
        const error = new HttpError('SignUp failed', 500);
        return next(error);
    };
   
    let token;
    try{
        token = jwt.sign({ userId: createUser.id, email: createUser.email },
                            process.env.JWT_KEY,
                            { expiresIn:'1h' });
    }catch(err){
        const error = new HttpError('SignUp failed', 500);
        return next(error);
    };

    res.status(201).json({ userId: createUser.id, email: createUser.email, token: token });

};

const userLogIn = async (req, res, next) =>{
    const { email, password } = req.body;
 
    let existedUser;
    try{
        existedUser = await User.findOne({ email : email});
    }catch(err){
        const error = new HttpError('Login failed', 500);
        return next(error);
    }
    if(!existedUser){
        const error = new HttpError('Could not identify user, credential seem to be wrong', 403);
        return next(error);
    }; 
    let passwordIsValid = false;
    try{
        passwordIsValid = await bcrypt.compare(password, existedUser.password);

    }catch(err){
        const error = new HttpError('Could not log you in, please check your credentials and try again', 500);
        return next(error);
    }
    
    if(!passwordIsValid){
    
        const error = new HttpError('Could not identify user, credential seem to be wrong', 403);
        return next(error);
    }

    let token;
    try{
        token = jwt.sign({ userId: existedUser.id, email: existedUser.email },
                            process.env.JWT_KEY,
                            {expiresIn:'1h'});
    }catch(err){
        const error = new HttpError('SignUp failed', 500);
        return next(error);
    };


    res.json({ userId: existedUser.id, email: existedUser.email, token: token});
};


exports.getAllUser = getAllUser;
exports.userSignUp = userSignUp;
exports.userLogIn = userLogIn; 