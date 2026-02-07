import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting climate data processing...\n');

// Parse CSV file
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/\r/g, ''));

    const data = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',');
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] ? values[index].trim().replace(/\r/g, '') : '';
        });
        data.push(row);
    }
    return { headers, data };
}

// Process city temperature and rainfall data
function processCityData(cityName, dataPath) {
    const filePath = path.join(dataPath, `${cityName.toLowerCase()}-temp-rains.csv`);

    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return null;
    }

    const { data } = parseCSV(filePath);

    // Group by month and calculate averages
    const monthlyData = {};

    data.forEach(row => {
        if (!row.Date) return;

        const date = row.Date;
        const parts = date.split('-');
        if (parts.length !== 3) return;

        const month = parseInt(parts[1]) - 1; // 0-indexed
        const rain = parseFloat(row.Rain) || 0;
        const tempMax = parseFloat(row['Temp Max']) || 0;
        const tempMin = parseFloat(row['Temp Min']) || 0;

        if (!monthlyData[month]) {
            monthlyData[month] = {
                rain: [],
                tempMax: [],
                tempMin: []
            };
        }

        monthlyData[month].rain.push(rain);
        monthlyData[month].tempMax.push(tempMax);
        monthlyData[month].tempMin.push(tempMin);
    });

    // Calculate monthly averages
    const monthlyAverages = [];
    for (let month = 0; month < 12; month++) {
        if (!monthlyData[month]) {
            monthlyAverages.push({ month, rain: 0, tempMax: 0, tempMin: 0, tempAvg: 0 });
            continue;
        }

        const avgRain = monthlyData[month].rain.reduce((a, b) => a + b, 0) / monthlyData[month].rain.length;
        const avgTempMax = monthlyData[month].tempMax.reduce((a, b) => a + b, 0) / monthlyData[month].tempMax.length;
        const avgTempMin = monthlyData[month].tempMin.reduce((a, b) => a + b, 0) / monthlyData[month].tempMin.length;
        const avgTemp = (avgTempMax + avgTempMin) / 2;

        monthlyAverages.push({
            month,
            rain: Math.round(avgRain * 100) / 100,
            tempMax: Math.round(avgTempMax * 100) / 100,
            tempMin: Math.round(avgTempMin * 100) / 100,
            tempAvg: Math.round(avgTemp * 100) / 100
        });
    }

    return monthlyAverages;
}

// Disease risk calculation based on real climate data
function calculateDiseaseRisk(cityData, disease, month) {
    if (!cityData || !cityData[month]) return 0;

    const { rain, tempAvg } = cityData[month];

    const diseaseParams = {
        malaria: {
            optimalTempMin: 20,
            optimalTempMax: 30,
            rainfallThreshold: 100,
            rainfallWeight: 0.4,
            tempWeight: 0.4,
            seasonalWeight: 0.2,
            peakMonths: [6, 7, 8, 9] // July-October (0-indexed)
        },
        dengue: {
            optimalTempMin: 22,
            optimalTempMax: 32,
            rainfallThreshold: 100,
            rainfallWeight: 0.4,
            tempWeight: 0.4,
            seasonalWeight: 0.2,
            peakMonths: [6, 7, 8, 9, 10] // July-November
        },
        cholera: {
            optimalTempMin: 15,
            optimalTempMax: 35,
            rainfallThreshold: 150,
            rainfallWeight: 0.5,
            tempWeight: 0.3,
            seasonalWeight: 0.2,
            peakMonths: [5, 6, 7, 8] // June-September
        },
        heatStroke: {
            optimalTempMin: 35,
            optimalTempMax: 50,
            rainfallThreshold: 50,
            rainfallWeight: -0.3, // Negative correlation
            tempWeight: 0.5,
            seasonalWeight: 0.2,
            peakMonths: [3, 4, 5] // April-June
        },
        respiratory: {
            optimalTempMin: 10,
            optimalTempMax: 25,
            rainfallThreshold: 50,
            rainfallWeight: 0.2,
            tempWeight: 0.5,
            seasonalWeight: 0.3,
            peakMonths: [10, 11, 0, 1] // November-February
        }
    };

    const params = diseaseParams[disease];
    if (!params) return 0;

    let risk = 0;

    // Temperature risk
    const tempMid = (params.optimalTempMin + params.optimalTempMax) / 2;
    const tempRange = params.optimalTempMax - params.optimalTempMin;

    if (tempAvg >= params.optimalTempMin && tempAvg <= params.optimalTempMax) {
        const tempScore = 100 - (Math.abs(tempAvg - tempMid) / (tempRange / 2)) * 30;
        risk += tempScore * Math.abs(params.tempWeight);
    } else {
        const deviation = Math.min(Math.abs(tempAvg - tempMid) - (tempRange / 2), 20);
        const tempScore = Math.max(0, 70 - deviation * 3);
        risk += tempScore * Math.abs(params.tempWeight);
    }

    // Rainfall risk
    if (params.rainfallWeight > 0) {
        // Positive correlation (more rain = more risk)
        const rainfallScore = Math.min(100, (rain / params.rainfallThreshold) * 100);
        risk += rainfallScore * params.rainfallWeight;
    } else {
        const cities = ['delhi', 'mumbai', 'chennai', 'bengaluru', 'kolkata', 'pune', 'hyd', 'amd'];
        const cityNames = {
            'delhi': 'Delhi',
            'mumbai': 'Mumbai',
            'chennai': 'Chennai',
            'bengaluru': 'Bangalore',
            'kolkata': 'Kolkata',
            'pune': 'Pune',
            'hyd': 'Hyderabad',
            'amd': 'Ahmedabad'
        };

        const processedData = {};

        cities.forEach(city => {
            console.log(`Processing ${cityNames[city]}...`);
            const cityData = processCityData(city, dataPath);
            if (cityData) {
                processedData[cityNames[city]] = cityData;
            }
        });

        // Calculate disease risks for all cities
        const diseases = ['malaria', 'dengue', 'cholera', 'heatStroke', 'respiratory'];
        const diseaseRisks = {};

        Object.keys(processedData).forEach(cityName => {
            diseaseRisks[cityName] = {};
            diseases.forEach(disease => {
                diseaseRisks[cityName][disease] = [];
                for (let month = 0; month < 12; month++) {
                    const risk = calculateDiseaseRisk(processedData[cityName], disease, month);
                    diseaseRisks[cityName][disease].push(risk);
                }
            });
        });

        // Save processed data
        const outputPath = path.join(__dirname, 'processed_climate_data.json');
        fs.writeFileSync(outputPath, JSON.stringify({
            climateData: processedData,
            diseaseRisks: diseaseRisks,
            metadata: {
                cities: Object.keys(processedData),
                diseases: diseases,
                generatedAt: new Date().toISOString(),
                dataSource: 'Real historical climate data from UsefulDataset'
            }
        }, null, 2));

        console.log(`\nProcessed data saved to: ${outputPath}`);
        console.log(`Cities processed: ${Object.keys(processedData).length}`);
        console.log(`Diseases analyzed: ${diseases.length}`);
        console.log('\n✅ Data processing completed successfully!');

        export {
            parseCSV,
            processCityData,
            calculateDiseaseRisk
        };  
