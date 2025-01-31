const express = require('express');
const mongoose = require('mongoose');

const app = express();

const userRouter = require("./routes/user.js")

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

mongoose.connect('mongodb+srv://chiraglokhande04:mdci1234@cluster0.au19e.mongodb.net/2FA')
    .then(() => {
        console.log("DB connected");
    })
    .catch((error) => {
        console.error("DB connection error:", error);
    });

  app.use('/api/user',userRouter)  
    
    
app.get('/', (req, res) => {
        console.log("Hello World");
        res.send("Hello World"); 
    });
    
app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });
    