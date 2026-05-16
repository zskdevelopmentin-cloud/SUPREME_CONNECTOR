# Supreme Connector 🚀

Supreme Connector is a professional bridge between local business software (Tally, REBOXY, Excel, CSV) and a centralized cloud dashboard. It enables real-time data visibility for companies managing multiple locations or offline ERP systems.

## Project Structure
- `/supreme-connector-web`: Next.js 14 Web Dashboard & API (Vercel Ready)
- `/local-agent`: Node.js background service for local PC data extraction

## Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase Compatible)
- **Local Agent**: Node.js, `xml2js`, `axios`, `node-cron`
- **Auth**: JWT via `jose`, bcryptjs

## Installation & Setup

### 1. Cloud Dashboard (Web)
```bash
cd supreme-connector-web
npm install
npx prisma generate
```
Configure your `.env`:
```env
DATABASE_URL="your_postgresql_url"
JWT_SECRET="your_secret_key"
```

### 2. Local Agent
```bash
cd local-agent
npm install
```
Configure your `.env`:
```env
CLOUD_API_URL=https://your-deployment.vercel.app
CONNECTOR_API_KEY=your_connector_api_key
CONNECTOR_ID=your_connector_id
SYNC_INTERVAL="*/5 * * * *"
```

## Running Locally
1. Start the web app: `npm run dev` in `supreme-connector-web`
2. Ensure Tally is running on port 9000 (standard).
3. Start the agent: `node index.js` in `local-agent`

## Key Modules
- **Authentication**: Secure multi-tenant login system.
- **Tally Sync**: Automatic extraction of Stock, Sales, and Vouchers via XML.
- **Sync Engine**: Interval-based queue with retry logic and detailed logs.
- **Dashboard**: Unified view of all synced data across multiple companies.

## Deployment
1. Push `supreme-connector-web` to Vercel.
2. Connect your Supabase/PostgreSQL database.
3. Run `npx prisma db push` to initialize the cloud database.
4. Register a new connector in the dashboard to get your API Key.
