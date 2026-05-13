import sys
import argparse
from config import config
from api_client import api_client
from sync_service import sync_service
from scheduler import start_scheduler
from logger import logger

def setup():
    print("=== Supreme Connector Setup ===")
    api_url = input(f"Enter API URL [{config.api_url}]: ").strip() or config.api_url
    company_id = input("Enter Company ID: ").strip()
    name = input(f"Enter Connector Name [{config.device_name}]: ").strip() or config.device_name

    config.api_url = api_url
    try:
        response = api_client.register_connector(company_id, name)
        config.save(
            api_key=response['api_key'],
            connector_id=response['connector_id'],
            company_id=company_id,
            api_url=api_url
        )
        print("Successfully registered connector!")
        print(f"Connector ID: {response['connector_id']}")
    except Exception as e:
        print(f"Error registering connector: {e}")

def main():
    parser = argparse.ArgumentParser(description="Supreme Connector Agent")
    parser.add_argument('command', choices=['setup', 'sync', 'start'], help="Command to run")
    
    args = parser.parse_args()

    if args.command == 'setup':
        setup()
    elif args.command == 'sync':
        logger.info("Manual sync triggered.")
        sync_service.run_sync()
    elif args.command == 'start':
        logger.info("Starting daemon mode.")
        start_scheduler()

if __name__ == "__main__":
    main()
