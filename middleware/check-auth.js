const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

module.exports = (req,res, next) =>{
    if(req.method === 'OPTIONS'){
        return next();
    }

    try{
        const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bear token' (get 2nd)
        if(!token){
            throw new HttpError('Authorizarion failed', 500);
        }
        const decodeToken = jwt.verify(token, process.env.JWT_KEY);
        req.userData = { userId: decodeToken.userId, email: decodeToken.email };
        next();
    }catch(err){
        const error = new HttpError('Authorizarion failed', 401);
        return next(error)

    }
}