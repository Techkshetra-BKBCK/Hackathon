import { Router } from "express";
import v1Routes from "./v1/index";
const app = Router();
app.use("/v1", v1Routes);
export default app;
