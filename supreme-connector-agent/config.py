import os
import json
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

CONFIG_FILE = Path.home() / ".supreme_connector.json"

class Config:
    def __init__(self):
        self.api_url = os.getenv("SUPREME_API_URL", "http://localhost:3000")
        self.api_key = None
        self.connector_id = None
        self.company_id = None
        self.device_name = os.getenv("COMPUTERNAME", "Unknown-PC")
        self.machine_id = self._get_machine_id()
        self.mock_mode = os.getenv("MOCK_MODE", "true").lower() == "true"
        self._load()

    def _get_machine_id(self):
        # simple mock machine ID for zero budget MVP
        import uuid
        return str(uuid.getnode())

    def _load(self):
        if CONFIG_FILE.exists():
            with open(CONFIG_FILE, "r") as f:
                data = json.load(f)
                self.api_key = data.get("api_key")
                self.connector_id = data.get("connector_id")
                self.company_id = data.get("company_id")
                self.api_url = data.get("api_url", self.api_url)

    def save(self, api_key, connector_id, company_id, api_url=None):
        self.api_key = api_key
        self.connector_id = connector_id
        self.company_id = company_id
        if api_url:
            self.api_url = api_url
            
        data = {
            "api_key": self.api_key,
            "connector_id": self.connector_id,
            "company_id": self.company_id,
            "api_url": self.api_url
        }
        with open(CONFIG_FILE, "w") as f:
            json.dump(data, f, indent=4)

config = Config()
