# Image CDN Migration (Best Practice)

## Goal
- Move business images out of mini-program package.
- Use object storage + CDN for faster loading and smaller package size.

## Recommended Architecture
- Store originals and derivatives in cloud storage (COS / CloudBase Storage).
- Expose through CDN domain.
- Keep only image keys in DB, not large local files.
- Resolve keys to URLs in cloud function layer.

## Data Fields (goods / merchants)
- `imageKey`: main image key, e.g. `prod/goods/101/full.webp`
- `thumbKey`: thumbnail key, e.g. `prod/goods/101/thumb.webp`
- `fullKey`: full image key, e.g. `prod/goods/101/full.webp`

Cloud function currently supports:
- Existing `image` URL
- New `imageKey`
- Optional `thumbKey/fullKey`

## Deployment Steps
1. Create storage bucket and CDN domain.
2. Upload images and generate two sizes:
   - Thumb: 300-500px
   - Full: 1000-1500px
3. Set cloud function env var:
   - `ASSET_BASE_URL=https://your-cdn-domain.com`
4. Batch update DB:
   - Fill `imageKey` (and optional `thumbKey/fullKey`)
5. Keep old `image` as fallback during migration.
6. After verification, remove large local image assets from mini-program package.

## Frontend Usage
- List pages: prefer `thumb` then `image`
- Detail pages: prefer `full` then `image`
- Add `lazy-load` to image components.
- Add image load error fallback.

## Notes
- Add CDN domain to mini-program domain whitelist.
- Use versioned file names to avoid stale cache.
- Do not store base64 images in database.
