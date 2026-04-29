async function testUpload() {
  try {
    console.log('Testing upload endpoint...');
    
    // Create a simple test to see if the route is accessible
    const response = await fetch('http://localhost:5000/api/upload/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testUpload();
