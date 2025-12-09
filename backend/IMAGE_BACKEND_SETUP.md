# Image Backend Media Upload Setup

## Problem
The image backend server at `https://lsl-platform.com/backend` needs an endpoint `/api/media/upload` to receive file uploads from the data backend.

## Solution
The upload endpoint is already integrated into the media routes. You just need to enable it on the image backend server.

## Steps to Deploy

### If image backend uses the same codebase

1. Set the environment variable on your image backend server:
```bash
ENABLE_IMAGE_BACKEND_UPLOAD=true
```

2. Make sure the `MEDIA_PATH` environment variable is set on the image backend server (e.g., `/var/www/media` or `C:\media`)

3. Restart the image backend server

The upload endpoint `/api/media/upload` will now be available and will save files to:
```
MEDIA_PATH/upload/{developerTag}/{projectTag}/{service}/{date}/{filename}
```

### If image backend is a separate server

Copy these files to your image backend:
- `backend/controllers/imageBackendMediaController.js`
- `backend/routes/imageBackendMedia.js`

And ensure the route is added (it's already integrated in `routes/media.js` when the env var is set).

## Environment Variables

On the image backend server, set:
- `MEDIA_PATH` - Path where files should be stored (e.g., `/var/www/media` or `C:\media`)

## File Structure

Files will be saved to:
```
MEDIA_PATH/upload/{developerTag}/{projectTag}/{service}/{date}/{filename}
```

Example:
```
/media/upload/age/dwd/Drone Shooting/2025-12-09/logo-dark.png
```

## Testing

After deployment, test the endpoint:
```bash
curl -X POST https://lsl-platform.com/backend/api/media/upload \
  -F "files=@test.jpg" \
  -F "developerTag=test" \
  -F "projectTag=test" \
  -F "service=Test Service" \
  -F "date=2025-12-09"
```

Expected response:
```json
{
  "message": "Files uploaded successfully",
  "files": ["test/test/Test Service/2025-12-09/test.jpg"],
  "count": 1
}
```

