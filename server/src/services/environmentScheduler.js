import {
  getOrCreateEnvironmentData,
  checkAndCreateAlerts,
  REGION_COORDINATES,
} from './environmentService.js';

const REGIONS = Object.keys(REGION_COORDINATES);

/**
 * Background job to update environment data for all regions
 * Should be called periodically (e.g., every hour)
 * 
 * NOTE: Alert creation is disabled - checkAndCreateAlerts will return early
 */
export const updateAllRegionsEnvironmentData = async () => {
  console.log('[Environment Scheduler] Starting environment data update...');
  const startTime = Date.now();

  try {
    // Process regions sequentially with a delay to avoid rate limits
    const results = [];
    for (const region of REGIONS) {
      try {
        // Add a 2-second delay before each request (except the first one)
        if (results.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        const envData = await getOrCreateEnvironmentData(region);
        // Alert creation is disabled - will return early
        await checkAndCreateAlerts(envData);
        console.log(`[Environment Scheduler] Updated data for ${region}`);
        results.push({ region, success: true });
      } catch (error) {
        console.error(`[Environment Scheduler] Error updating ${region}:`, error.message);
        results.push({ region, success: false, error: error.message });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const duration = Date.now() - startTime;

    console.log(
      `[Environment Scheduler] Completed: ${successCount}/${REGIONS.length} regions updated in ${duration}ms`
    );

    return {
      success: true,
      updated: successCount,
      total: REGIONS.length,
      duration,
      results,
    };
  } catch (error) {
    console.error('[Environment Scheduler] Fatal error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Start periodic updates (every 30 minutes to avoid rate limits)
 */
export const startEnvironmentScheduler = () => {
  // Initial update
  updateAllRegionsEnvironmentData();

  // Schedule periodic updates (every 30 minutes)
  const interval = setInterval(() => {
    updateAllRegionsEnvironmentData();
  }, 30 * 60 * 1000); // 30 minutes

  console.log('[Environment Scheduler] Started - will update every 30 minutes to respect API rate limits');

  return () => {
    clearInterval(interval);
    console.log('[Environment Scheduler] Stopped');
  };
};

