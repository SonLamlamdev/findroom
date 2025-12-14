PROJECT UPDATE LOG: Fixed Image Upload, Storage, and Display System

1. Root Cause Analysis

Upload Logic: The app was using upload.js (Memory Storage) but the controller listings.js was written as if it were using upload-cloudinary.js (Cloudinary Storage middleware). This caused req.files to contain buffers instead of file paths, resulting in empty data in the database.

Module Exports: upload.js had a logic error where module.exports = upload overwrote the helper function uploadToCloudinary, causing TypeError: is not a function.

Frontend Display: imageHelper.ts was not correctly normalizing local file paths (missing /uploads/ prefix), leading to 404 errors for local images.

Deployment: Render failed to detect the open port because the server was listening on localhost instead of 0.0.0.0.

2. Backend Changes

backend/middleware/upload.js (Major Refactor)

Changed storage engine to multer.memoryStorage() when using Cloudinary to allow manual parallel uploading in the controller.

Fixed export structure: Attached uploadToCloudinary directly to the upload object (upload.uploadToCloudinary = ...) to prevent overwriting.

Added fallback to Local Disk Storage if Cloudinary credentials are missing.

backend/routes/listings.js

Updated POST and PUT routes to manually call uploadMiddleware.uploadToCloudinary(req.files).

Added a helper getMediaFromProcessedFiles to robustly extract URLs (file.path or file.url) from the upload result.

backend/server.js

Added app.use('/uploads', express.static('uploads')) to serve local files.

Updated app.listen to bind to 0.0.0.0 to resolve Render "No open ports" timeout.

Added process.exit(1) on MongoDB connection failure to fail fast instead of hanging.

3. Frontend Changes

frontend/src/utils/imageHelper.ts

Updated logic to detect if a path is a full URL (Cloudinary) or a relative path (Local).

If local, it now automatically prepends /uploads/ and the VITE_API_URL to ensure valid links.

Added handling for Windows-style backslashes (\).

frontend/src/pages/ListingDetail.tsx

Added onError event handler to <img> tags.

If an image fails to load (404), it automatically swaps the source to a placeholder image (https://placehold.co...), preventing broken UI elements.

4. Added support pages including:
    - FAQ
    - Privacy Policy
    - Terms of use
    - About us