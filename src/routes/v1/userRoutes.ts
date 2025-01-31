import { Router } from "express";
import usercontroller from "../../controllers/usercontroller";
const app = Router();
app.post("/signup", usercontroller.signup);
app.post("/signin", usercontroller.signIn);
export default app;
