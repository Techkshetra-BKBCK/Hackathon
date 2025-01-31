require("dotenv").config();
const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

// Firebase Admin SDK Setup
const serviceAccount = require("../serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project-id.firebaseio.com",
});

const db = admin.firestore();
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// 🔹 Test Route
app.get("/", (req, res) => {
  res.send("Cloud Security Backend is Running! ✅");
});

app.listen(PORT, () => console.log(Server running on port ${PORT} 🚀));