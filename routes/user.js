const express = require('express');
const userRouter = express.Router();
const userController = require("../controllers/user.js");


// Public Routes (No Middleware Required)
userRouter.post('/signup', userController.signup);
userRouter.post('/login', userController.login);
userRouter.post('/logout', userController.logout);
userRouter.post('/verifyEmail', userController.verifyEmail);


module.exports = userRouter;

