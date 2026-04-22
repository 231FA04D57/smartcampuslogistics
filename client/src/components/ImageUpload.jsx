import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const ImageUpload = ({ onImageUpload }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!image) {
      setError('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('file', image);

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/upload/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onImageUpload(res.data.url);
      setImage(null);
      setPreview(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-upload-container">
      <div className="upload-preview">
        {preview && <img src={preview} alt="Preview" className="preview-image" />}
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        disabled={loading}
        style={{ marginBottom: '1rem' }}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button
        onClick={handleUpload}
        disabled={!image || loading}
        className="btn-primary"
      >
        {loading ? 'Uploading...' : 'Upload Image'}
      </button>
    </div>
  );
};

export default ImageUpload;
