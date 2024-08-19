const multer = require('multer');
const path = require('path');

// Define the storage location and filename format
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where files will be uploaded
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`); // Generate a unique filename
  }
});

// Initialize multer with the storage configuration
const upload = multer({ storage });

module.exports = upload;
