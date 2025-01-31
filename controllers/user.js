const bcrypt = require('bcrypt');
const User = require('../models/user.js')
const jwt = require('jsonwebtoken');

const { sendOTP} = require("../utils/email");
const {generateVerificationCode} = require('../utils/generateToken')

const signup = async(req, res) => {
    try {
        const { username, email,mobile, password} = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = generateVerificationCode()

        const userData = await User.create({
            username,
            email,
            mobile,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
          
        });

        await sendOTP(email,verificationToken);
         
        res.status(201).json({ message: 'User created successfully', user: userData });
    } catch (err) {
        console.log("Error in creating user:", err);
        res.status(500).json({ message: 'Error in creating user', error: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            console.log("Wrong password");
            return res.status(400).json({ message: "Invalid Password" });
        }
        // Generate a token
        const token = jwt.sign(
            { userId: existingUser._id, email: existingUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } 
        );
        
        try{
            res.cookie("token", token, {
                httpOnly: true,
                //secure: process.env.NODE_ENV === 'production', // Only set on HTTPS in production
                sameSite: "Strict", // Adjust based on your CSRF protection needs
                maxAge: 3600000 // 1 hour in milliseconds
            });

            console.log("cookie is storeed !! lessgooooooooo")

        }catch(err){
            console.log("cookie is  not storeed !! less not gooooooooo", err)
        }

      

        console.log("Loggend In successfull", existingUser,token)

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: existingUser._id,
                username: existingUser.username,
                email: existingUser.email
            }
        });
    } catch (err) {
        console.error("Error during login:", err);
        return res.status(500).json({ message: 'Error during login', error: err.message });
    }
};

const logout = async (req,res) => {
    try {
        return res.clearCookie("token").status(200).json({
            success: true,
            message: "Logged out successfully."
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
};



//Verification Emails
const verifyEmail = async(req,res)=>{
    const {verificationToken} = req.body;
    try{
        console.log(req.body)
         console.log(verificationToken)
        const user = await User.findOne({verificationToken:verificationToken,verificationTokenExpiresAt:{$gt : Date.now()}})

        if(!user){
            console.log("NO user found")
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token"
            });
        }
        console.log("user found:", user)
          
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined ;
        await user.save()
        await sendWelcomeEmail(user.email,user.username)

        res.status(200).json({success:true,message:"Email Verified Successfully"})
    }catch(err){
        console.log('Err in email verification', err)
        res.status(500).json({message:'Error in verifyEmail Controller'})
    }
}



module.exports = {
    signup,
    login,
    logout,
    verifyEmail,
    
};
