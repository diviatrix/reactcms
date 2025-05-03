const express = require('express');
const fs = require('fs'); // Use the callback-based fs module
const path = require('path');
const multer = require('multer'); // To handle file uploads

const router = express.Router();

// Define the path to the public directory
const publicDirectory = path.resolve(__dirname, '../public');

// Ensure public directory exists
// In a real application, consider if auto-creation is desired or if it should fail if missing.
if (!fs.existsSync(publicDirectory)) {
    try {
        fs.mkdirSync(publicDirectory, { recursive: true });
        console.log(`Public directory created at: ${publicDirectory}`);
    } catch (err) {
        console.error(`Error creating public directory at ${publicDirectory}:`, err);
        // Depending on requirements, you might want to exit or throw the error
        // For now, we'll log and continue, but routes might fail later.
    }
}


// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, publicDirectory); // Save files directly into the public directory
    },
    filename: function (req, file, cb) {
        // WARNING: Using originalname is insecure if filenames are user-controlled.
        // Consider sanitizing filenames or generating unique names in production.
        cb(null, file.originalname);
    }
});
const upload = multer({
    storage: storage,
    // Add limits and file filtering for security and stability
    // limits: { fileSize: 10 * 1024 * 1024 }, // Example: 10MB limit
    // fileFilter: (req, file, cb) => { /* Check file type, etc. */ cb(null, true); }
});


// --- Route Handlers ---

// Handler function for listing files
const listPublicFiles = (_req, res) => {
    fs.access(publicDirectory, fs.constants.R_OK, (err) => { // Check for read access
        if (err) {
            console.error('Error accessing public directory:', err);
            return res.status(err.code === 'ENOENT' ? 404 : 500)
                      .json({ message: `Error accessing public directory: ${err.code}` });
        }

        fs.readdir(publicDirectory, (err, files) => {
            if (err) {
                console.error('Error reading public directory:', err);
                return res.status(500).json({ message: 'Error listing files.' });
            }

            // Construct URLs for the files, linking via the static middleware path
            const fileLinks = files.map(file => `/public/${encodeURIComponent(file)}`);
            res.json(fileLinks);
        });
    });
};


// --- Route Definitions ---

// GET /: Serves the index.html file from the public directory
router.get('/', (_req, res) => {
    const indexPath = path.join(publicDirectory, 'index.html');
    fs.access(indexPath, fs.constants.R_OK, (err) => {
        if (err) {
            // If index.html doesn't exist or isn't readable, maybe list files or send 404
            console.warn(`index.html not found or not readable in ${publicDirectory}.`);
            // Option 1: Fallback to listing files
            // listPublicFiles(_req, res);
            // Option 2: Send a 404
            return res.status(404).send('Resource not found.');
            // Option 3: Send a simple welcome message
            // return res.send('Welcome!');
        } else {
            res.sendFile(indexPath);
        }
    });
});

// GET /files: Lists all files in the public directory
router.get('/files', listPublicFiles);

// POST /: Handles file uploads to the public directory
// 'file' should match the name attribute of the file input field in the form
router.post('/', upload.single('file'), (req, res) => {
    // Multer middleware 'upload.single("file")' handles the file saving process.
    // If a file was uploaded, req.file contains file details.
    // If no file or an error occurred, multer calls next() with an error or req.file is undefined.

    if (!req.file) {
        // This might happen if the field name doesn't match 'file' or no file was sent
        return res.status(400).json({ message: 'No file uploaded or incorrect field name.' });
    }

    // File uploaded successfully
    res.status(201).json({
        message: 'File uploaded successfully.',
        filename: req.file.filename,
        path: `/public/${encodeURIComponent(req.file.filename)}` // URL to access the file
    });
}, (error, req, res, next) => {
    // Optional: Express error handler specifically for Multer errors
    if (error instanceof multer.MulterError) {
        // A Multer error occurred (e.g., file size limit exceeded)
        console.error('Multer error during upload:', error);
        return res.status(400).json({ message: `Upload error: ${error.message}` });
    } else if (error) {
        // An unknown error occurred
        console.error('Unknown error during upload:', error);
        return res.status(500).json({ message: 'An unexpected error occurred during upload.' });
    }
    // If no error, but file wasn't processed (should have been caught earlier)
    if (!req.file) {
         return res.status(400).json({ message: 'File upload failed.' });
    }
    // Fallthrough if needed, though typically response is sent in the main handler
    next();
});


// GET /:filename - Serves a specific file directly from the root path
// NOTE: This attempts to serve files from the public directory when requested at the root.
// Example: GET /my-image.png tries to serve public/my-image.png
// This might conflict with other routes if not placed carefully.
// It comes AFTER specific routes like /public/*
router.get('/:filename', (req, res, next) => {
    const filename = req.params.filename;

    // Basic security: Prevent path traversal and invalid characters. Adjust as needed.
    if (!filename || filename.includes('/') || filename.includes('..')) {
        return res.status(400).send('Invalid filename.');
    }

    const filePath = path.join(publicDirectory, filename);

    // Check if the file exists and is readable
    fs.access(filePath, fs.constants.R_OK, (err) => {
        if (err) {
            // File not found or not accessible
            if (err.code === 'ENOENT') {
                 // Special handling for common browser requests that might hit this route
                 if (filename === 'favicon.ico') {
                     return res.status(204).end(); // No Content for favicon
                 }
                console.log(`File not found: ${filename}`);
                return res.status(404).send('File not found.');
            }
            // Other access error (e.g., permissions)
            console.error(`Error accessing file ${filename}:`, err);
            return res.status(500).send('Error accessing file.');
        }

        // Check if it's a directory - typically don't serve directories directly this way
        fs.stat(filePath, (statErr, stats) => {
            if (statErr) {
                console.error(`Error getting stats for file ${filename}:`, statErr);
                return res.status(500).send('Error accessing file.');
            }
            if (stats.isDirectory()) {
                // Decide how to handle requests for directories at the root
                console.log(`Attempt to access directory as file: ${filename}`);
                return res.status(403).send('Access denied.'); // Forbidden to access directory this way
            }
            // Serve the file
            res.sendFile(filePath, (sendErr) => {
                if (sendErr) {
                    console.error(`Error sending file ${filename}:`, sendErr);
                    // Avoid sending another response if headers already sent
                    if (!res.headersSent) {
                        res.status(500).send('Error sending file.');
                    }
                }
            });
        });
    });
});


// DELETE /:filename - Deletes a specific file from the public directory
// WARNING: This is a destructive operation and requires strong security measures
// (authentication, authorization) in a real application.
router.delete('/:filename', (req, res) => {
    const filename = req.params.filename;

    // Basic security: Prevent path traversal and invalid characters. Adjust as needed.
    if (!filename || filename.includes('/') || filename.includes('..')) {
        return res.status(400).json({ message: 'Invalid filename.' });
    }

    const filePath = path.join(publicDirectory, filename);

    // Check if file exists before attempting deletion
    fs.access(filePath, fs.constants.F_OK, (err) => { // Check for existence first
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).json({ message: 'File not found.' });
            }
            // Other error checking existence (e.g., permissions on parent dir)
            console.error(`Error checking existence for deletion ${filename}:`, err);
            return res.status(500).json({ message: 'Error accessing file for deletion.' });
        }

        // File exists, attempt deletion
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
                console.error(`Error deleting file ${filename}:`, unlinkErr);
                // Handle specific errors like EPERM (permissions) if necessary
                if (unlinkErr.code === 'EPERM') {
                    return res.status(403).json({ message: 'Permission denied to delete file.' });
                }
                return res.status(500).json({ message: 'Error deleting file.' });
            }

            console.log(`File deleted: ${filename}`);
            // Success: Respond with 200 OK and message, or 204 No Content
            res.status(200).json({ message: `File '${filename}' deleted successfully.` });
            // Alternatively: res.status(204).end();
        });
    });
});


// Export the router
module.exports = router;
