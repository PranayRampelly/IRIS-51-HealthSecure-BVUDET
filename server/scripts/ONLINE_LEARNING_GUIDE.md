# Online Learning System - Quick Start Guide

## Overview

The online learning system continuously collects real-time API data and incrementally updates disease prediction models to improve accuracy over time.

## Features

✅ **Automated Data Collection**: Fetches weather and AQI data every hour
✅ **Incremental Training**: Updates models daily with new data
✅ **Model Versioning**: Tracks update count and timestamps
✅ **Buffer Management**: Stores API data until sufficient for training
✅ **Multi-Mode Operation**: Collect-only, train-only, or continuous

## Quick Start

### Option 1: Python Service (Recommended for Development)

```bash
# Navigate to scripts directory
cd server/scripts

# Run in continuous mode (collect hourly, train daily)
python online_learning_service.py --mode continuous

# Run data collection only (every 2 hours)
python online_learning_service.py --mode collect --collect-interval 2

# Run training only (every 12 hours)
python online_learning_service.py --mode train --train-interval 12
```

### Option 2: Node.js Manager (Recommended for Production)

```bash
# Navigate to server directory
cd server

# Start the service
node src/services/online_learning_manager.js start

# Stop the service
node src/services/online_learning_manager.js stop

# Manually collect data
node src/services/online_learning_manager.js collect

# Manually train models
node src/services/online_learning_manager.js train

# Check status
node src/services/online_learning_manager.js status
```

### Option 3: Integrate with Server

Add to `server/src/server.js`:

```javascript
const onlineLearningManager = require('./services/online_learning_manager');

// Start online learning when server starts
onlineLearningManager.start('continuous', 1, 24);

// Graceful shutdown
process.on('SIGTERM', () => {
    onlineLearningManager.stop();
    process.exit(0);
});
```

## How It Works

### 1. Data Collection Phase

Every hour (configurable):
- Fetches real-time weather data from OpenWeatherMap API
- Fetches AQI data (if API key available)
- Stores data in buffer: `online_learning_data/api_data_buffer.json`
- Logs to monthly file: `online_learning_data/api_data_YYYYMM.json`

### 2. Training Phase

Every 24 hours (configurable):
- Checks if buffer has ≥10 records
- Applies feature engineering (70+ features)
- Generates disease labels based on epidemiological rules
- Incrementally updates Random Forest models
- Saves updated models
- Clears buffer

### 3. Model Updates

Models are updated in-place:
- `models_comprehensive/malaria_model.pkl`
- `models_comprehensive/dengue_model.pkl`
- `models_comprehensive/cholera_model.pkl`
- `models_comprehensive/heat_stroke_model.pkl`
- `models_comprehensive/respiratory_diseases_model.pkl`

Metrics file updated with:
```json
{
  "Malaria": {
    "online_learning": {
      "enabled": true,
      "last_updated": "2025-11-28T12:30:00",
      "update_count": 5
    }
  }
}
```

## Configuration

### Environment Variables

```bash
# OpenWeatherMap API Key (required)
OPENWEATHER_API_KEY=your_api_key_here

# IQAir API Key (optional, for AQI data)
IQAIR_API_KEY=your_api_key_here
```

### Intervals

- **Data Collection**: 1-24 hours (default: 1 hour)
- **Model Training**: 1-168 hours (default: 24 hours)

**Recommendations**:
- Development: Collect every 1 hour, train every 24 hours
- Production: Collect every 1 hour, train every 24-48 hours
- Testing: Collect every 5 minutes, train every 1 hour

## Monitoring

### Check Buffer Status

```python
from online_learning_service import OnlineLearningService
service = OnlineLearningService()
print(f"Buffer size: {len(service.api_data_buffer)} records")
```

### View Training Logs

```bash
# Check model update counts
cat server/scripts/models_comprehensive/comprehensive_ml_metrics.json | grep update_count

# View collected data
cat server/scripts/online_learning_data/api_data_buffer.json
```

### Monitor Service

```bash
# Check if service is running
ps aux | grep online_learning_service

# View logs (if using systemd)
journalctl -u online-learning -f
```

## Production Deployment

### Using systemd (Linux)

Create `/etc/systemd/system/online-learning.service`:

```ini
[Unit]
Description=Disease Prediction Online Learning Service
After=network.target

[Service]
Type=simple
User=bioaura
WorkingDirectory=/path/to/server/scripts
ExecStart=/usr/bin/python3 online_learning_service.py --mode continuous
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable online-learning
sudo systemctl start online-learning
sudo systemctl status online-learning
```

### Using PM2 (Node.js)

```bash
pm2 start src/services/online_learning_manager.js --name "online-learning"
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
# Add to Dockerfile
RUN pip install schedule

# Add to docker-compose.yml
services:
  online-learning:
    build: .
    command: python scripts/online_learning_service.py --mode continuous
    environment:
      - OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
    restart: always
```

## Troubleshooting

### Service Won't Start

```bash
# Check Python dependencies
pip install schedule pandas numpy scikit-learn joblib requests

# Check API keys
echo $OPENWEATHER_API_KEY

# Test manually
python online_learning_service.py --mode collect --collect-interval 999
```

### No Data Being Collected

- Verify API key is set
- Check internet connection
- Review error logs
- Test API manually: `curl "https://api.openweathermap.org/data/2.5/weather?q=Delhi,IN&appid=YOUR_KEY"`

### Models Not Updating

- Check buffer has ≥10 records
- Verify training interval has elapsed
- Check for positive disease cases in new data
- Review training logs

### High Memory Usage

- Reduce buffer size (train more frequently)
- Use smaller training intervals
- Monitor with: `ps aux | grep python | grep online_learning`

## API Endpoints (Optional)

Add to `server/src/routes/bioAura.js`:

```javascript
const onlineLearningManager = require('../services/online_learning_manager');

// Get online learning status
router.get('/online-learning/status', (req, res) => {
    const status = onlineLearningManager.getStatus();
    const buffer = onlineLearningManager.getBufferStats();
    res.json({ status, buffer });
});

// Manually trigger data collection
router.post('/online-learning/collect', async (req, res) => {
    try {
        await onlineLearningManager.collectData();
        res.json({ success: true, message: 'Data collection triggered' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manually trigger training
router.post('/online-learning/train', async (req, res) => {
    try {
        await onlineLearningManager.trainModels();
        res.json({ success: true, message: 'Training triggered' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

## Best Practices

1. **Start Small**: Begin with longer intervals, reduce as needed
2. **Monitor Closely**: Watch first few training cycles
3. **Backup Models**: Keep versioned backups before updates
4. **Log Everything**: Enable detailed logging for debugging
5. **Test Locally**: Verify on development before production
6. **API Limits**: Respect OpenWeatherMap rate limits (60 calls/min)

## Performance Impact

- **CPU**: Minimal during collection, moderate during training
- **Memory**: ~100MB during collection, ~2GB during training
- **Disk**: ~1MB per day of collected data
- **Network**: ~1KB per API call (8 cities = 8KB/hour)

## Support

For issues or questions:
1. Check logs in `online_learning_data/`
2. Review model metrics in `models_comprehensive/comprehensive_ml_metrics.json`
3. Test individual components manually
4. Verify API keys and connectivity

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2025-11-28
