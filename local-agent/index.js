require('dotenv').config();
const cron = require('node-cron');
const TallyClient = require('./tally-client');
const ApiClient = require('./api-client');

const tally = new TallyClient();
const api = new ApiClient(process.env.CLOUD_API_URL, process.env.CONNECTOR_API_KEY);

const SYNC_INTERVAL = process.env.SYNC_INTERVAL || '*/5 * * * *'; // Default 5 mins

console.log('=== Supreme Connector Local Agent Started ===');
console.log(`Syncing with: ${process.env.CLOUD_API_URL}`);
console.log(`Schedule: ${SYNC_INTERVAL}`);

async function runSync() {
  console.log(`[${new Date().toLocaleString()}] Starting Sync...`);
  
  try {
    // 1. Fetch Stock Items
    console.log('Fetching Stock Items from Tally...');
    const stockData = await tally.getStockItems();
    
    // 2. Upload to Cloud
    console.log('Uploading to Cloud...');
    const result = await api.uploadData('products', stockData);
    
    // 3. Log Success
    await api.logSync(process.env.CONNECTOR_ID, 'success', result.count || 0);
    console.log('Sync completed successfully.');
  } catch (error) {
    console.error('Sync failed:', error.message);
    await api.logSync(process.env.CONNECTOR_ID, 'failed', 0, error.message);
  }
}

// Schedule the sync
cron.schedule(SYNC_INTERVAL, () => {
  runSync();
});

// Run immediately on start
runSync();
