import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get ML-based disease predictions for a city
 */
export const getMLPredictions = async (req, res) => {
    try {
        const { city } = req.params;
        const { disease, tempMax, tempMin, rain, useLive } = req.query;

        const scriptsPath = path.join(__dirname, '../../scripts');
        const args = ['prediction_service.py', '--city', city];

        if (useLive === 'true') {
            args.push('--live');
        } else if (disease && tempMax && tempMin && rain !== undefined) {
            args.push('--disease', disease);
            args.push('--temp-max', tempMax);
            args.push('--temp-min', tempMin);
            args.push('--rain', rain);
        } else if (tempMax && tempMin && rain !== undefined) {
            args.push('--temp-max', tempMax);
            args.push('--temp-min', tempMin);
            args.push('--rain', rain);
        } else {
            args.push('--live');
        }

        const python = spawn('python', args, {
            cwd: scriptsPath
        });

        let output = '';
        let errorOutput = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        python.on('close', (code) => {
            if (code !== 0) {
                console.error('Python error:', errorOutput);
                return res.status(500).json({
                    error: 'Prediction failed',
                    details: errorOutput
                });
            }

            try {
                // Clean output - extract only JSON content
                let cleanOutput = output.trim();

                // Try to find JSON object/array in the output
                const jsonMatch = cleanOutput.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
                if (jsonMatch) {
                    cleanOutput = jsonMatch[0];
                }

                const result = JSON.parse(cleanOutput);
                res.json(result);
            } catch (parseError) {
                console.error('Parse error:', parseError);
                console.error('Raw output:', output);
                res.status(500).json({
                    error: 'Failed to parse prediction result',
                    details: parseError.message,
                    rawOutput: output.substring(0, 500) // First 500 chars for debugging
                });
            }
        });

    } catch (error) {
        console.error('Error in ML predictions:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get predictions for all cities
 */
export const getAllCitiesPredictions = async (req, res) => {
    try {
        const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad'];
        const scriptsPath = path.join(__dirname, '../../scripts');

        const predictions = {};
        let completed = 0;

        for (const city of cities) {
            const python = spawn('python', ['prediction_service.py', '--city', city, '--live'], {
                cwd: scriptsPath
            });

            let output = '';

            python.stdout.on('data', (data) => {
                output += data.toString();
            });

            python.on('close', (code) => {
                if (code === 0 && output) {
                    try {
                        predictions[city] = JSON.parse(output);
                    } catch (e) {
                        console.error(`Parse error for ${city}:`, e);
                    }
                }

                completed++;
                if (completed === cities.length) {
                    res.json({
                        predictions,
                        timestamp: new Date().toISOString(),
                        cities: Object.keys(predictions)
                    });
                }
            });
        }

    } catch (error) {
        console.error('Error in all cities predictions:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get DL-based predictions for all cities
 */
export const getAllCitiesPredictionsDL = async (req, res) => {
    try {
        const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad'];
        const scriptsPath = path.join(__dirname, '../../scripts');

        const predictions = {};
        let completed = 0;

        for (const city of cities) {
            const python = spawn('python', ['dl_prediction_service.py', '--city', city], {
                cwd: scriptsPath
            });

            let output = '';
            let errorOutput = '';

            python.stdout.on('data', (data) => {
                output += data.toString();
            });

            python.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            python.on('close', (code) => {
                if (code === 0 && output) {
                    try {
                        predictions[city] = JSON.parse(output);
                    } catch (e) {
                        console.error(`Parse error for ${city}:`, e);
                    }
                } else if (errorOutput) {
                    console.error(`DL prediction error for ${city}:`, errorOutput);
                }

                completed++;
                if (completed === cities.length) {
                    res.json({
                        predictions,
                        model_type: 'deep_learning',
                        timestamp: new Date().toISOString(),
                        cities: Object.keys(predictions)
                    });
                }
            });
        }

    } catch (error) {
        console.error('Error in DL predictions:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get Gemini AI-enhanced predictions for all cities
 */
export const getAllCitiesPredictionsGemini = async (req, res) => {
    try {
        const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad'];
        const scriptsPath = path.join(__dirname, '../../scripts');
        const predictions = {};
        let completed = 0;

        for (const city of cities) {
            const python = spawn('python', ['gemini_prediction_service.py', '--city', city], {
                cwd: scriptsPath
            });

            let output = '';
            let errorOutput = '';

            python.stdout.on('data', (data) => {
                output += data.toString();
            });

            python.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            python.on('close', (code) => {
                if (code === 0 && output) {
                    try {
                        predictions[city] = JSON.parse(output);
                    } catch (e) {
                        console.error(`Gemini parse error for ${city}:`, e);
                    }
                } else if (errorOutput) {
                    console.error(`Gemini error for ${city}:`, errorOutput);
                }

                completed++;
                if (completed === cities.length) {
                    res.json({
                        predictions,
                        model_type: 'gemini_enhanced',
                        timestamp: new Date().toISOString(),
                        cities: Object.keys(predictions)
                    });
                }
            });
        }
    } catch (error) {
        console.error('Error in Gemini predictions:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get ML-based disease forecast for future months
 */
export const getMLForecast = async (req, res) => {
    try {
        const { city } = req.params;
        const { disease, months = 12 } = req.query;

        const scriptsPath = path.join(__dirname, '../../scripts');
        const args = ['forecast_service.py', '--city', city, '--months', months.toString()];

        if (disease) {
            args.push('--disease', disease);
        }

        const python = spawn('python', args, {
            cwd: scriptsPath
        });

        let output = '';
        let errorOutput = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        python.on('close', (code) => {
            if (code !== 0) {
                console.error('Python error:', errorOutput);
                return res.status(500).json({
                    error: 'Forecast generation failed',
                    details: errorOutput
                });
            }

            try {
                const result = JSON.parse(output);
                res.json(result);
            } catch (parseError) {
                console.error('Parse error:', parseError);
                res.status(500).json({
                    error: 'Failed to parse forecast result',
                    output
                });
            }
        });

    } catch (error) {
        console.error('Error in ML forecast:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get feature importance for a disease model
 */
export const getFeatureImportance = async (req, res) => {
    try {
        const { disease } = req.params;
        const scriptsPath = path.join(__dirname, '../../scripts');

        const python = spawn('python', [
            'advanced_analytics.py',
            '--action', 'feature-importance',
            '--disease', disease
        ], { cwd: scriptsPath });

        let output = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.on('close', (code) => {
            if (code === 0) {
                try {
                    res.json(JSON.parse(output));
                } catch (e) {
                    res.status(500).json({ error: 'Parse error' });
                }
            } else {
                res.status(500).json({ error: 'Failed to get feature importance' });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get prediction explanation
 */
export const getPredictionExplanation = async (req, res) => {
    try {
        const { city, disease } = req.params;
        const scriptsPath = path.join(__dirname, '../../scripts');

        const python = spawn('python', [
            'advanced_analytics.py',
            '--action', 'explanation',
            '--city', city,
            '--disease', disease
        ], { cwd: scriptsPath });

        let output = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.on('close', (code) => {
            if (code === 0) {
                try {
                    res.json(JSON.parse(output));
                } catch (e) {
                    res.status(500).json({ error: 'Parse error' });
                }
            } else {
                res.status(500).json({ error: 'Failed to get explanation' });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get risk calendar
 */
export const getRiskCalendar = async (req, res) => {
    try {
        const { city, disease } = req.params;
        const { year = 2025, month = 11 } = req.query;
        const scriptsPath = path.join(__dirname, '../../scripts');

        const python = spawn('python', [
            'advanced_analytics.py',
            '--action', 'calendar',
            '--city', city,
            '--disease', disease,
            '--year', year.toString(),
            '--month', month.toString()
        ], { cwd: scriptsPath });

        let output = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.on('close', (code) => {
            if (code === 0) {
                try {
                    res.json(JSON.parse(output));
                } catch (e) {
                    res.status(500).json({ error: 'Parse error' });
                }
            } else {
                res.status(500).json({ error: 'Failed to get calendar' });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get multi-city comparison
 */
export const getMultiCityComparison = async (req, res) => {
    try {
        const { disease } = req.params;
        const scriptsPath = path.join(__dirname, '../../scripts');

        const python = spawn('python', [
            'advanced_analytics.py',
            '--action', 'comparison',
            '--disease', disease
        ], { cwd: scriptsPath });

        let output = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.on('close', (code) => {
            if (code === 0) {
                try {
                    res.json(JSON.parse(output));
                } catch (e) {
                    res.status(500).json({ error: 'Parse error' });
                }
            } else {
                res.status(500).json({ error: 'Failed to get comparison' });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get Pharmacy Intelligence data for outbreak detection
 */
export const getPharmacyIntelligence = async (req, res) => {
    try {
        const { city } = req.query;
        const scriptsPath = path.join(__dirname, '../../scripts');

        const args = ['data_sources/pharmacy_intelligence.py'];
        if (city) {
            args.push('--city', city);
        } else {
            args.push('--all');
        }

        const python = spawn('python', args, {
            cwd: scriptsPath
        });

        let output = '';
        let errorOutput = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        python.on('close', (code) => {
            if (code === 0 && output) {
                try {
                    const result = JSON.parse(output);
                    res.json(result);
                } catch (e) {
                    console.error('Pharmacy Intelligence parse error:', e);
                    res.status(500).json({ error: 'Failed to parse pharmacy data' });
                }
            } else {
                console.error('Pharmacy Intelligence error:', errorOutput);
                res.status(500).json({ error: errorOutput || 'Pharmacy intelligence service failed' });
            }
        });
    } catch (error) {
        console.error('Error in pharmacy intelligence:', error);
        res.status(500).json({ error: error.message });
    }
};
