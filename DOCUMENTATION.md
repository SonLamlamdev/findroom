[v1.2.0] - 2025-12-16

Implemented search debouncing (500ms delay) on Map View filters to reduce API calls and eliminate marker flickering.

Added scroll restoration to automatically reset window position to top on route changes.

Enabled language persistence to remember user preference (English/Vietnamese) across sessions via localStorage.

Updated map marker color logic to match 2025 market prices: Green (< 2.5M), Yellow (2.5-5M), Red (> 5M).

Expanded navigation permissions to allow Admin accounts access to the Roommate Finder tool.

Fixed a React Router crash by correctly nesting the scroll restoration component within the router context.

[v1.1.0] - 2025-12-15

Implemented full localization (i18n) for About, FAQ, Privacy Policy, and Terms of Service pages in English and Vietnamese.

Restored the "Message Landlord" button functionality for tenants on Listing Detail pages.

Added deep-linking capabilities to navigate directly from a listing to a specific conversation.

Implemented self-healing backend logic to automatically detect and remove corrupt "ghost conversations".

Enabled optimistic UI updates for User Profile changes to reflect instantly without page reloads.

Fixed frontend crashes caused by blog posts referencing deleted user accounts.

Corrected navigation links for "Saved Roommates" and added visual icons to the user dropdown menu.

[v1.0.5] - 2025-12-14

Refactored the entire image upload pipeline to fix buffer handling between Multer and Cloudinary.

Fixed image path normalization logic to correctly handle both local uploads and remote Cloudinary URLs.

Updated server configuration to bind to 0.0.0.0 to resolve deployment timeouts on Render.

Added fail-fast logic for MongoDB connections to prevent the server from hanging in an unstable state.

Configured Express to correctly serve static files from the local storage directory.