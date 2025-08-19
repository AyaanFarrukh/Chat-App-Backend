import multer from "multer";
import cloudinary from "../config/cloudinary.mjs";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "chat-user-profiles",
        allowed_formats: ["jpeg", "jpg", "png", "webp", "gif", "avif", "heic"],
        public_id: (req,file) => Date.now() + "-" + file.originalname
    }
})

const upload = multer({ storage });

export default upload;