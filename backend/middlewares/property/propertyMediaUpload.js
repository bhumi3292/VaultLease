const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        // Create a unique filename to prevent conflicts
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
    },
});

const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/quicktime", "video/webm"];

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true); // Accept the file
        } else {
            cb(new Error("Unsupported file type!"), false); // Reject the file
        }
    },
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
});

const uploadPropertyMedia = upload.fields([
    { name: "images", maxCount: 10 },
]);

module.exports = uploadPropertyMedia;