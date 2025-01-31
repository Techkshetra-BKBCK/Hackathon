import { Router } from "express";
import userRoutes from "./userRoutes";
const app = Router();
app.use("/user", userRoutes);

export default app;
