
import axios from 'axios';

const testAlerts = async () => {
    try {
        const url = 'http://localhost:5000/api/bioaura/environment/alerts';
        console.log(`Fetching alerts from ${url}...`);

        const response = await axios.get(url);

        if (response.data) {
            console.log('✅ Success!');
            console.log('Summary:', JSON.stringify(response.data.summary, null, 2));
            console.log('Alerts count:', response.data.alerts.length);
            if (response.data.message) {
                console.log('Message:', response.data.message);
            }
        } else {
            console.log('❌ No data returned');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
};

testAlerts();
