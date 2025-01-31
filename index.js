import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import helmet from 'helmet';
import morgan from 'morgan';

import { connectDB } from "./db/connectDB.js";

// Import your new middlewares
import firewallMiddleware from './middleware/firewall.js';
import idsMiddleware from './middleware/ids.js';


import authRoutes from "./routes/auth.route.js";
import adminRoute from './routes/admin.route.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json()); // allows us to parse incoming requests:req.body
app.use(cookieParser()); // allows us to parse incoming cookies


// 1) Apply firewall
app.use(firewallMiddleware);

// 2) Apply IDS
app.use(idsMiddleware);


app.use("/api/auth", authRoutes);
app.use('/api/admin', adminRoute);


// Simple homepage route
app.get('/', (req, res) => {
	res.send('API is running...');
  });

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.listen(PORT, () => {
	connectDB();
	console.log("Server is running on port: ", PORT);
});
