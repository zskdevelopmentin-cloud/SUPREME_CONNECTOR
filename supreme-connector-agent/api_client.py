import requests
from config import config
from logger import logger

class APIClient:
    def __init__(self):
        self.base_url = config.api_url
        self.headers = {
            "Content-Type": "application/json",
            "x-api-key": config.api_key
        }

    def register_connector(self, company_id, name):
        url = f"{self.base_url}/api/connectors/register"
        payload = {
            "company_id": company_id,
            "name": name,
            "device_name": config.device_name,
            "machine_id": config.machine_id,
            "app_version": "1.0.0"
        }
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()

    def start_sync(self):
        url = f"{self.base_url}/api/sync/start"
        payload = {"connector_id": config.connector_id}
        response = requests.post(url, json=payload, headers=self.headers)
        response.raise_for_status()
        return response.json().get("batch_id")

    def push_data(self, batch_id, data):
        url = f"{self.base_url}/api/sync/push"
        payload = {
            "company_id": config.company_id,
            "connector_id": config.connector_id,
            "batch_id": batch_id,
            "source": "tally",
            "data": data
        }
        response = requests.post(url, json=payload, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def finish_sync(self, batch_id, records_processed):
        url = f"{self.base_url}/api/sync/finish"
        payload = {
            "connector_id": config.connector_id,
            "batch_id": batch_id,
            "records_processed": records_processed
        }
        response = requests.post(url, json=payload, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def report_error(self, batch_id, error_message):
        url = f"{self.base_url}/api/sync/error"
        payload = {
            "connector_id": config.connector_id,
            "batch_id": batch_id,
            "error_message": error_message
        }
        response = requests.post(url, json=payload, headers=self.headers)
        response.raise_for_status()
        return response.json()

api_client = APIClient()
