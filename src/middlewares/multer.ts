import multer from "multer";
import { uploadToCloudinary } from "../utils/cloudinary/cloudinary";

const storage = multer.memoryStorage();

const limits = { fileSize: 50 * 1024 * 1024 };

const upload = multer({ storage, limits });

export default upload;
