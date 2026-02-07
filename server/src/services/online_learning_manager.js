/**
 * Online Learning Service Manager
 * Node.js wrapper to manage the Python online learning service
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OnlineLearningManager {
    constructor() {
        this.pythonProcess = null;
        this.scriptsPath = path.join(__dirname, '../../scripts');
        this.isRunning = false;
    }

    /**
     * Start the online learning service
     * @param {string} mode - 'collect', 'train', or 'continuous'
     * @param {number} collectInterval - Hours between data collection (default: 1)
     * @param {number} trainInterval - Hours between training (default: 24)
     */
    start(mode = 'continuous', collectInterval = 1, trainInterval = 24) {
        if (this.isRunning) {
            console.log('⚠️  Online learning service is already running');
            return;
        }

        console.log('🚀 Starting online learning service...');
        console.log(`   Mode: ${mode}`);
        console.log(`   Data collection: Every ${collectInterval} hour(s)`);
        console.log(`   Model training: Every ${trainInterval} hour(s)`);

        const args = [
            path.join(this.scriptsPath, 'online_learning_service.py'),
            '--mode', mode,
            '--collect-interval', collectInterval.toString(),
            '--train-interval', trainInterval.toString()
        ];

        this.pythonProcess = spawn('python', args, {
            cwd: this.scriptsPath,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        this.pythonProcess.stdout.on('data', (data) => {
            console.log(`[Online Learning] ${data.toString().trim()}`);
        });

        this.pythonProcess.stderr.on('data', (data) => {
            // stderr contains debug/info messages from Python scripts, not necessarily errors
            console.log(`[Online Learning Info] ${data.toString().trim()}`);
        });

        this.pythonProcess.on('close', (code) => {
            console.log(`Online learning service stopped with code ${code}`);
            this.isRunning = false;
        });

        this.isRunning = true;
        console.log('✅ Online learning service started');
    }

    /**
     * Stop the online learning service
     */
    stop() {
        if (!this.isRunning || !this.pythonProcess) {
            console.log('⚠️  Online learning service is not running');
            return;
        }

        console.log('⏹️  Stopping online learning service...');
        this.pythonProcess.kill('SIGTERM');
        this.isRunning = false;
        console.log('✅ Online learning service stopped');
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            pid: this.pythonProcess ? this.pythonProcess.pid : null
        };
    }

    /**
     * Manually trigger data collection
     */
    async collectData() {
        console.log('📡 Manually triggering data collection...');

        return new Promise((resolve, reject) => {
            const process = spawn('python', [
                path.join(this.scriptsPath, 'online_learning_service.py'),
                '--mode', 'collect',
                '--collect-interval', '999999'  // Large number to run once
            ], {
                cwd: this.scriptsPath
            });

            let output = '';
            process.stdout.on('data', (data) => {
                output += data.toString();
                console.log(data.toString().trim());
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(`Data collection failed with code ${code}`));
                }
            });

            // Kill after 30 seconds (one collection cycle)
            setTimeout(() => {
                process.kill('SIGTERM');
            }, 30000);
        });
    }

    /**
     * Manually trigger model training
     */
    async trainModels() {
        console.log('🤖 Manually triggering model training...');

        return new Promise((resolve, reject) => {
            const process = spawn('python', [
                '-c',
                `
from online_learning_service import OnlineLearningService
service = OnlineLearningService()
service.run_incremental_training()
                `.trim()
            ], {
                cwd: this.scriptsPath
            });

            let output = '';
            process.stdout.on('data', (data) => {
                output += data.toString();
                console.log(data.toString().trim());
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(`Training failed with code ${code}`));
                }
            });
        });
    }

    /**
     * Get buffer statistics
     */
    getBufferStats() {
        const bufferPath = path.join(this.scriptsPath, 'online_learning_data', 'api_data_buffer.json');

        if (!fs.existsSync(bufferPath)) {
            return { records: 0, size: 0 };
        }

        const buffer = JSON.parse(fs.readFileSync(bufferPath, 'utf8'));
        const stats = fs.statSync(bufferPath);

        return {
            records: buffer.length,
            size: stats.size,
            lastModified: stats.mtime
        };
    }
}

// Singleton instance
const onlineLearningManager = new OnlineLearningManager();

export default onlineLearningManager;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    const command = args[0] || 'start';

    switch (command) {
        case 'start':
            onlineLearningManager.start('continuous', 1, 24);
            break;
        case 'stop':
            onlineLearningManager.stop();
            break;
        case 'collect':
            onlineLearningManager.collectData();
            break;
        case 'train':
            onlineLearningManager.trainModels();
            break;
        case 'status':
            console.log(onlineLearningManager.getStatus());
            console.log(onlineLearningManager.getBufferStats());
            break;
        default:
            console.log('Usage: node online_learning_manager.js [start|stop|collect|train|status]');
    }
}
