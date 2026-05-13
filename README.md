# Supreme Connector

A standalone, production-ready system to bridge local ERP software (like Tally) with cloud dashboards like Reboxy.

## Architecture

The system consists of two parts:
1. **Supreme Connector Web (`supreme-connector-web`)**: A Next.js 14 application serving as the cloud backend and admin dashboard. Powered by Supabase PostgreSQL and Prisma ORM.
2. **Supreme Connector Agent (`supreme-connector-agent`)**: A Python CLI tool that runs on the user's local PC, extracts data, and pushes it to the cloud.

## Features
- Secure API-key-based connector authentication
- Automatic data synchronization via Python scheduler
- Dynamic Admin Dashboard for monitoring sync logs and connectors
- REST APIs designed specifically for Reboxy dashboard integration
- Mock mode included for zero-budget MVP testing

See `SETUP_GUIDE.md` for installation instructions.
