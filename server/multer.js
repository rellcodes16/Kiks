const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the absolute path to the upload directory
const uploadDir = path.join(__dirname, '/tmp/uploads');

// Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`Directory ${uploadDir} created successfully`);
    } catch (err) {
        console.error(`Error creating directory: ${err}`);
        // Handle the error accordingly
    }
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Images only!'));
    }
};

// Export a function that takes a field name and returns the upload middleware
const uploadMiddleWare = (fieldName) => {
    return multer({
        storage: storage,
        limits: { fileSize: 1000000 }, // 1MB limit
        fileFilter: fileFilter,
    }).single(fieldName);
};

module.exports = uploadMiddleWare;
