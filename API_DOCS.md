# API Documentation

## Connector Registration

### `POST /api/connectors/register`
Registers a new connector device.
- **Body:** `{ "company_id": "cuid", "name": "Main PC", "device_name": "PC-1", "machine_id": "1234", "app_version": "1.0" }`
- **Response:** `{ "connector_id": "cuid", "api_key": "raw_hex_string" }`

## Sync Engine

*Note: All Sync endpoints require the `x-api-key` header.*

### `POST /api/sync/start`
Starts a sync batch.
- **Body:** `{ "connector_id": "cuid" }`
- **Response:** `{ "batch_id": "BATCH-123" }`

### `POST /api/sync/push`
Pushes data to the cloud.
- **Body:** `{ "company_id": "cuid", "connector_id": "cuid", "batch_id": "BATCH-123", "source": "tally", "data": { ... } }`
- **Response:** `{ "message": "Batch pushed successfully" }`

### `POST /api/sync/finish`
Finishes the sync batch.
- **Body:** `{ "batch_id": "BATCH-123", "records_processed": 100 }`
- **Response:** `{ "message": "Sync finished successfully" }`

### `POST /api/sync/error`
Logs a sync error.
- **Body:** `{ "batch_id": "BATCH-123", "error_message": "Timeout" }`
- **Response:** `{ "message": "Error logged successfully" }`

## Reboxy Integration

*These APIs are consumed by the Reboxy Dashboard frontend or backend.*

- `GET /api/reboxy/dashboard?companyId=123`
- `GET /api/reboxy/companies`
- `GET /api/reboxy/reports/sales?companyId=123`
- `GET /api/reboxy/sync-status?companyId=123`
