import dotenv from "dotenv";
dotenv.config();
export default {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,

  // firebase configurations
  FIREBASE_API_KEY: process.env.apiKey,
  AUTH_DOMAIN: process.env.authDomain,
  PROJECT_ID: process.env.projectId,
  STORAGE_BUCKET: process.env.storageBucket,
  MESSAGING_SENDER_ID: process.env.messagingSenderId,
  APP_ID: process.env.appId,
  MEASUREMENT_ID: process.env.measurementId,

  //cloudinary configurations
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_URL: process.env.CLOUDINARY_URL,
};
