const generateVerificationCode = () => {
    const characters = '1234567890abcdefghijklmnopqrstuvwxyz';
    let verificationCode = '';
    const length = 6; // Properly define length with const
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) { // Use 'let' for loop variable
        verificationCode += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return verificationCode;
};


module.exports ={
    generateVerificationCode
}