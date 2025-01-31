import express from "express";
import type { Express } from "express";
import serverconfig from "./config/serverconfig";
import { connectToDatabase } from "./config/database";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoutes from "./routes/index";
import { errorMiddleware } from "./middlewares/error";
import { AuthMiddleware } from "./middlewares/auth";
import sampleTestRouter from "./sampletest";
class Server {
  app: Express;
  constructor() {
    this.app = express();
    this.middleware();
    this.routes();
  }
  private middleware() {
    this.app.use(cors());
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(errorMiddleware);
  }
  private routes() {
    this.app.use("/api", apiRoutes);
    this.app.use("/upload", sampleTestRouter);
  }
  public async start() {
    await connectToDatabase();
    this.app.listen(serverconfig.PORT, () => {
      console.log(`server started , http://localhost:${serverconfig.PORT}`);
    });
  }
}
export default new Server();
