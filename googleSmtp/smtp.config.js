import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

export const mailOptions = {
  from: "TEAM THE CODEX!",
};