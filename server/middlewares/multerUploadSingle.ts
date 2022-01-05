import { NextFunction, Response } from "express";
import multer from "multer";
import upload from "../utils/multerConfig";

export const multerUploadSingle = async (
  req: any,
  res: Response,
  next: NextFunction,
  fileName: string
) => {
  // const upload = multer().single()
  // upload(req, res, (err) => {})
  // for us, upload = multer, so upload above becames file
  const file = upload.single(fileName);

  file(req, res, (err) => {
    // file size error
    if (err instanceof multer.MulterError) {
      return res.status(400).send({
        success: false,
        data: {},
        message: err.message,
        statusCode: 400,
      });
    } else if (err) {
      // invalid file type
      return res.status(400).send({
        success: false,
        data: {},
        message: "Unsupported image type",
        statusCode: 400,
      });
    }
    next();
  });
};