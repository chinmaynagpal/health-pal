import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadDataUri(dataUri, folder = "health-pal") {
  const res = await cloudinary.uploader.upload(dataUri, { folder });
  return res.secure_url;
}

export default cloudinary;
