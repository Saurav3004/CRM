import multer from "multer";
import path from "path";

const storage = multer.memoryStorage(); // <-- changed from diskStorage

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".xlsx" || ext === ".xls" || ext === ".csv") {
    cb(null, true);
  } else {
    cb(new Error("Only Excel or CSV files allowed"), false);
  }
};


export default multer({ storage, fileFilter });
