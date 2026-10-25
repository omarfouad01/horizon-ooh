# Imported project photo branding

The imported campaign photos were rebranded with the supplied original Horizon OOH PNG logos. Use the navy logo on light panels and the white logo on dark panels. Advertiser artwork and client logos are retained.

The manifest records the original URLs and hashes, replacement URLs and hashes, unchanged unbranded images, and the rectangles used for each layout. Full-resolution lossless masters are retained privately; public copies are optimized WebP at quality 92 with the original pixel dimensions; media files remain in application storage. Original files are retained privately for rollback.

The maintenance renderer requires Node.js and ImageMagick 6. Set PROJECT_PHOTO_BRANDING_WORKSPACE to an isolated private directory containing inventory.json (with local source file paths), horizon-light.png, and horizon-dark.png. The reviewed combined inventory uses stable index values recorded in the manifest. Run the renderer there, inspect its contact sheets, and verify pixels outside the branding rectangles before updating project URLs through a database transaction. Do not run image preparation inside public storage or overwrite source photographs.
