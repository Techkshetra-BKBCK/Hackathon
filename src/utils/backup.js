const cron = require('node-cron');
const { exec } = require('child_process');

cron.schedule('0 0 * * *', () => {
    // Daily backup at midnight
    exec('mongodump --db inventory_tracker --out ./backup');
});