import schedule
import time
from sync_service import sync_service
from logger import logger

def job():
    logger.info("Running scheduled sync...")
    sync_service.run_sync()

def start_scheduler():
    logger.info("Starting scheduler. Auto-sync every 30 minutes.")
    schedule.every(30).minutes.do(job)
    
    # Run once immediately
    job()

    while True:
        schedule.run_pending()
        time.sleep(1)
