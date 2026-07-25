const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");

function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WEBP, or HEIC images are allowed."));
  }
}

/**
 * Creates a Multer instance that saves into uploads/<subfolder>/.
 * Used so different features (prescriptions, medical reports, etc.) keep
 * their uploaded files organized in separate folders.
 */
function createUploader(subfolder) {
  const dir = path.join(UPLOAD_ROOT, subfolder);
  fs.mkdirSync(dir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });
}

const upload = createUploader("prescriptions");
const reportUpload = createUploader("medical-reports");

module.exports = { upload, reportUpload, createUploader, UPLOAD_ROOT };
