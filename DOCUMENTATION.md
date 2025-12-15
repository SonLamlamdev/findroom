📝 Project Release Notes
[v1.1.0] - 2025-12-15
Focus: Localization, Messaging System, and User Experience Polish.

🚀 New Features

🌐 Internationalization (i18n):

Implemented full English (en) and Vietnamese (vi) support.

Launched fully localized support pages: About Us, FAQ, Privacy Policy, and Terms of Service.

Refactored core page components to utilize the useTranslation hook for dynamic text rendering.

💬 Messaging System:

UI Restoration: Re-integrated the "Message Landlord" button on ListingDetail pages (visible only to tenants).

Smart Navigation: Enabled deep-linking from a listing directly to a specific conversation context.

Self-Healing Architecture: Implemented automated backend logic to detect and prune "ghost conversations" (corrupt data referencing deleted users), preventing 403 Access Denied loops.

👤 User Experience:

Instant Profile Updates: Refactored AuthContext and Profile to support optimistic UI updates, reflecting changes immediately without page reloads.

Visual Cues: Added a FiClock icon to the "Stayed History" link in the navigation menu.

🐛 Bug Fixes

Blog & Community:

Crash Prevention: Implemented safe navigation (?.) for blog posts with deleted authors to prevent runtime errors.

Sorting Logic: Moved "Sort by Likes" logic to an in-memory operation to bypass MongoDB Aggregation limitations on the current environment.

Pagination: Fixed data discrepancies where filtering null authors caused pagination under-fetching.

Security & Navigation:

ID Comparison: Refactored backend routes to safely compare MongoDB ObjectId vs String IDs.

Broken Links: Fixed the "Saved Roommates" link in Navbar.tsx which previously pointed to "Saved Listings".

[v1.0.5] - 2025-12-14
Focus: Critical Infrastructure, Image Pipeline, and Deployment Stability.

🛠 Critical System Repairs

🖼️ Image Upload Pipeline:

Middleware Refactor: Overhauled upload.js to correctly export the uploadToCloudinary helper function without overwriting the multer instance.

Storage Logic: Switched to multer.memoryStorage() for Cloudinary uploads to ensure file buffers are available for processing.

Path Normalization: Updated imageHelper.ts to correctly distinguish and format local file paths (prepending /uploads/ and API URL) vs. remote Cloudinary URLs.

Fallback Handling: Implemented onError handlers for images to swap broken sources with a placeholder.

☁️ Infrastructure & Deployment:

Render Binding: Updated server.js to bind to 0.0.0.0 instead of localhost, resolving "No open ports detected" deployment timeouts.

Database Safety: Added process.exit(1) on MongoDB connection failures to ensure the app fails fast rather than hanging.

Static Serving: Configured Express to serve files from the local /uploads directory.

📂 Files Modified (Cumulative)

Frontend:

src/i18n/config.ts

src/components/Navbar.tsx

src/contexts/AuthContext.tsx

src/utils/imageHelper.ts

src/pages/* (About, Blog, FAQ, ListingDetail, Messages, Privacy, Profile, Terms)

Backend:

backend/middleware/upload.js

backend/routes/blogs.js

backend/routes/listings.js

backend/routes/messages.js

backend/server.js