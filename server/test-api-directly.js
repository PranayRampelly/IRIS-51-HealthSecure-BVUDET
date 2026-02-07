import axios from 'axios';

const testApiDirectly = async () => {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGE0ZDE1OTE2ZGM1NmU3NTMyZjQyYzMiLCJyb2xlIjoicGhhcm1hY3kiLCJpYXQiOjE3NTU3OTQ5NTgsImV4cCI6MTc1NjM5OTc1OH0.VXJUFmpPjQ0UJDD2eO-QIev_6XJyPbXzr1Fu95PocMs';
    const pharmacyId = '68a4d15916dc56e7532f42c3';
    
    console.log('Testing API call to:');
    console.log(`http://localhost:5000/api/pharmacy/orders/patients`);
    console.log('With token:', token.substring(0, 50) + '...');
    
    const response = await axios.get(`http://localhost:5000/api/pharmacy/orders/patients`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.error('API call failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Full error:', error.response?.data);
  }
};

testApiDirectly();
