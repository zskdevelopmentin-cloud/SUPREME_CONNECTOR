import time
from api_client import api_client
from logger import logger
from config import config
import random
from datetime import datetime, timedelta

class SyncService:
    def __init__(self):
        pass

    def _generate_mock_data(self):
        # Generate realistic Tally-like data for MVP
        parties = [
            {"externalId": "P1", "name": "Acme Corp", "group": "Sundry Debtors", "balance": 50000},
            {"externalId": "P2", "name": "Global Tech", "group": "Sundry Creditors", "balance": -20000}
        ]
        
        sales = [
            {
                "externalId": f"INV-{random.randint(1000, 9999)}",
                "invoiceNo": f"INV-{random.randint(1000, 9999)}",
                "date": datetime.now().isoformat(),
                "partyName": "Acme Corp",
                "amount": random.uniform(1000, 10000)
            } for _ in range(5)
        ]
        
        inventory = [
            {"externalId": "I1", "name": "Laptop", "group": "Electronics", "stock": 50, "uom": "Nos"},
            {"externalId": "I2", "name": "Mouse", "group": "Electronics", "stock": 200, "uom": "Nos"}
        ]
        
        return {
            "parties": parties,
            "sales": sales,
            "purchases": [],
            "inventory": inventory,
            "payments": [],
            "receipts": []
        }

    def run_sync(self):
        if not config.api_key or not config.connector_id:
            logger.error("Connector not registered. Please run 'setup' first.")
            return

        batch_id = None
        try:
            logger.info("Starting sync process...")
            batch_id = api_client.start_sync()
            logger.info(f"Sync batch ID: {batch_id}")

            # Pull data
            if config.mock_mode:
                logger.info("MOCK_MODE is enabled. Generating mock data...")
                data = self._generate_mock_data()
            else:
                logger.warning("Real Tally integration coming soon. Falling back to mock data.")
                data = self._generate_mock_data()

            # Calculate total records
            records_processed = sum(len(items) for items in data.values() if isinstance(items, list))

            # Push data
            logger.info(f"Pushing {records_processed} records to cloud...")
            api_client.push_data(batch_id, data)

            # Finish sync
            api_client.finish_sync(batch_id, records_processed)
            logger.info("Sync completed successfully.")

        except Exception as e:
            logger.error(f"Sync failed: {str(e)}")
            if batch_id:
                try:
                    api_client.report_error(batch_id, str(e))
                except Exception as ne:
                    logger.error(f"Failed to report error to cloud: {str(ne)}")

sync_service = SyncService()
