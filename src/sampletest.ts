import express, { Request, Response } from "express";
import upload from "./middlewares/multer";
import { uploadToCloudinary } from "./utils/cloudinary/cloudinary";

const router = express.Router();

router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const fileUrl = await uploadToCloudinary(req.file!.buffer, "auto");
    res.json({ fileUrl });
  } catch (error: any) {
    res.status(500).json({
      message: "File upload to Cloudinary failed",
      error: error.message,
    });
  }
});

export default router;
