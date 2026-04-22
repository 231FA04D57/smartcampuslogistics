async function testLogin() {
  try {
    console.log('Testing admin login...');
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin', password: 'Admin@2026' })
    });
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('Response:', data);
    } else {
      console.error('❌ Login failed!');
      console.error('Error:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();
