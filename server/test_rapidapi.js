
import axios from 'axios';

const RAPIDAPI_KEY = '41bc9971famsh8865f5acfbb2ae1p1376b9jsn096b7abe6802';
const RAPIDAPI_HOST = 'air-quality.p.rapidapi.com';

const REGION_COORDINATES = {
    Delhi: { lat: 28.6139, lng: 77.2090 },
    Mumbai: { lat: 19.0760, lng: 72.8777 }
};

const testRapidAPI = async () => {
    for (const [region, coords] of Object.entries(REGION_COORDINATES)) {
        console.log(`Testing RapidAPI for ${region}...`);
        const url = `https://${RAPIDAPI_HOST}/current/airquality?lon=${coords.lng}&lat=${coords.lat}`;

        try {
            const response = await axios.get(url, {
                headers: {
                    'x-rapidapi-key': RAPIDAPI_KEY,
                    'x-rapidapi-host': RAPIDAPI_HOST
                },
                timeout: 8000
            });

            if (response.data) {
                console.log(`✅ Success for ${region}`);
                console.log('Data:', JSON.stringify(response.data, null, 2));
            } else {
                console.log(`❌ No data for ${region}`);
            }
        } catch (error) {
            console.error(`❌ Error for ${region}:`, error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
            }
        }
        console.log('---');
    }
};

testRapidAPI();
