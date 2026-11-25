import multer from "multer";
import path from "path";
import { HttpError } from "../error";

const storage = multer.diskStorage({
  destination: path.join(process.cwd(), "uploads", "avatars"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const userId = req.user?.userId;
    cb(null, `${userId}${ext}`);
  },
});

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new HttpError(400, "Avatar must be JPEG, PNG, or WebP."));
    }
    cb(null, true);
  },
});

