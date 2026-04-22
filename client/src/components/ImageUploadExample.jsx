import React, { useState } from 'react';
import ImageUpload from './ImageUpload';

/**
 * Example: How to use ImageUpload Component
 * 
 * This example shows how to integrate the ImageUpload component
 * to upload images to Cloudinary and retrieve their URLs.
 */

const ImageUploadExample = () => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  const handleImageUpload = (url) => {
    console.log('Image uploaded successfully:', url);
    setUploadedImageUrl(url);
    // You can now use this URL:
    // - Store in database
    // - Display in preview
    // - Send with form submission
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Image Upload Example</h1>
      
      {/* Use the ImageUpload component */}
      <ImageUpload onImageUpload={handleImageUpload} />

      {/* Display the uploaded image */}
      {uploadedImageUrl && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Uploaded Image:</h2>
          <img 
            src={uploadedImageUrl} 
            alt="Uploaded" 
            style={{ maxWidth: '100%', borderRadius: '8px' }}
          />
          <p><strong>URL:</strong> {uploadedImageUrl}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploadExample;
