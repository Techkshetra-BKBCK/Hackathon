import express from "express";
import authRoutes from "./routes/auth.route.js";

const app = express();

// Middleware
//app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.listen(3000, () => {
    console.log(`Server is listening at port 3000`);
});
