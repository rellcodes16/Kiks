const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the upload directory
const uploadDir = '/tmp/uploads';

// Ensure the directory exists
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadMultiple = multer({ storage }).array('images', 10); // Adjust '10' based on your needs

module.exports = uploadMultiple;
