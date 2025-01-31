const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    mobile: {
        type: String,
        unique:true,
        sparse: true ,
        match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number']
    },
    public_key: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },   
    verificationToken: { type: String },
    verificationTokenExpiresAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetTokenExpiresAt: { type: Date }
   
},  {timestamps: true})

module.exports = mongoose.model('User', userSchema);