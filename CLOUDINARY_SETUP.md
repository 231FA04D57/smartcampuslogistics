# Cloudinary Image Upload Setup - Quick Reference

## ✅ What's Been Set Up

### Backend
- ✅ **Dependencies Installed**: cloudinary, multer, multer-storage-cloudinary
- ✅ **Upload Route**: `server/routes/upload.js` - Handles image uploads to Cloudinary
- ✅ **Server Configuration**: `server/server.js` - Routes registered at `/api/upload`
- ✅ **Environment Variables**: `.env` updated with Cloudinary configuration

### Frontend
- ✅ **ImageUpload Component**: `client/src/components/ImageUpload.jsx`
- ✅ **Example Component**: `client/src/components/ImageUploadExample.jsx`

---

## 🔑 Important: Add Your Cloudinary Credentials

**Edit `server/.env` and replace:**

```env
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

Get these from: https://cloudinary.com/console/

---

## 📝 API Endpoints

### Upload Image
```
POST /api/upload/upload
Content-Type: multipart/form-data

Request Body:
- file: File (image)

Response:
{
  "message": "Image uploaded successfully",
  "url": "https://res.cloudinary.com/...",
  "public_id": "smartcampus/..."
}
```

### Delete Image
```
DELETE /api/upload/delete/:public_id

Response:
{
  "message": "Image deleted successfully"
}
```

---

## 💻 Frontend Usage

### Basic Usage
```jsx
import ImageUpload from './components/ImageUpload';

function MyComponent() {
  const handleImageUpload = (imageUrl) => {
    console.log('Image uploaded:', imageUrl);
    // Store imageUrl in state or database
  };

  return (
    <ImageUpload onImageUpload={handleImageUpload} />
  );
}
```

### In SellItem Component
```jsx
import ImageUpload from './ImageUpload';

const SellItem = () => {
  const [imageUrl, setImageUrl] = useState('');

  const handleImageUpload = (url) => {
    setImageUrl(url);
    // Use url when submitting the form
  };

  return (
    <div>
      <ImageUpload onImageUpload={handleImageUpload} />
      {imageUrl && <img src={imageUrl} alt="Item" />}
    </div>
  );
};
```

---

## 🚀 Testing Locally

1. **Start Backend**:
   ```bash
   cd server
   npm start
   ```

2. **Start Frontend**:
   ```bash
   cd client
   npm run dev
   ```

3. **Test Upload**:
   - Go to http://localhost:5174
   - Use the ImageUpload component
   - Verify image appears on Cloudinary dashboard

---

## 🌐 Deployment to Render

Add environment variables to Render:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check Cloudinary credentials |
| File not uploading | Verify image format (jpg, jpeg, png, gif) |
| CORS errors | Backend already has CORS enabled |
| 403 Forbidden | Check Cloudinary API permissions |

---

## 📚 Key Files

- Backend: `server/routes/upload.js`
- Frontend: `client/src/components/ImageUpload.jsx`
- Example: `client/src/components/ImageUploadExample.jsx`
- Server: `server/server.js` (routes registered)
- Config: `server/.env` (credentials)

---

## ✨ Features

✅ Drag & drop support
✅ File type validation
✅ Image preview before upload
✅ Loading state during upload
✅ Error handling
✅ Delete functionality
✅ Automatic Cloudinary integration
