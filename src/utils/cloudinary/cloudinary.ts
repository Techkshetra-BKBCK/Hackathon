import { v2 as cloudinary } from "cloudinary";
import serverconfig from "../../config/serverconfig";

cloudinary.config({
  cloud_name: serverconfig.CLOUDINARY_CLOUD_NAME,
  api_key: serverconfig.CLOUDINARY_API_KEY,
  api_secret: serverconfig.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(
  fileBuffer: Buffer,
  originalName: string,
  resourceType: "auto" | "image" | "video" | "raw" = "auto"
): Promise<string> {
  try {
    const extension = originalName.split(".").pop() || "";

    const publicId = `uploads/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`;

    const result = await new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: "uploads",
          public_id: publicId,
        },
        (error, result) => {
          if (error) {
            return reject(
              new Error("Cloudinary upload failed: " + error.message)
            );
          }
          resolve(result?.secure_url || "");
        }
      );

      stream.end(fileBuffer);
    });

    return result;
  } catch (error: any) {
    throw new Error("Cloudinary upload failed: " + error.message);
  }
}

export { uploadToCloudinary };
