import multer from "multer";
import { Request } from "express";

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: any, cb: multer.FileFilterCallback) => {
  const ext = file.mimetype.split("/")[1];

  if (ext === "jpeg" || ext === "png" || ext === "jpg") {
    return cb(null, true);
  }

  return cb(new Error("Unsupported image type"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
});

export default upload;