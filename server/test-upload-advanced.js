/**
 * Test upload endpoint with a simple image buffer
 */
const fs = require('fs');
const FormData = require('form-data');

async function testUpload() {
  try {
    console.log('Testing Cloudinary upload endpoint...\n');

    // Create a simple PNG buffer (1x1 red pixel)
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x01, 0x00, 0x05, 0x3B, 0x1A, 0x9E, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    // Create FormData
    const form = new FormData();
    form.append('file', pngBuffer, { filename: 'test.png' });

    const response = await fetch('http://localhost:5000/api/upload/upload', {
      method: 'POST',
      body: form
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.url) {
      console.log('\n✅ Upload successful!');
      console.log('Image URL:', data.url);
      console.log('Public ID:', data.public_id);
    } else {
      console.log('\n❌ Upload failed');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testUpload();
