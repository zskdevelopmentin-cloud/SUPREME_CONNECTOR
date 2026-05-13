# Setup Guide (Firebase Edition)

## 1. Web Backend (Next.js)

1. Navigate to the web folder: `cd supreme-connector-web`
2. Install dependencies: `npm install`
3. Since the database was changed from Supabase to **Firebase Firestore**, you need to generate a Service Account JSON file from your Firebase Project Settings.
4. Set up environment variables in a `.env` file:
   ```env
   FIREBASE_PROJECT_ID="your-project-id"
   FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com"
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
   JWT_SECRET="your-super-secret-key"
   ```
5. Run development server: `npm run dev`

*Note: Ensure the Vercel deployment also has these Environment Variables set exactly as above.*

## 2. Python Agent

1. Navigate to the agent folder: `cd supreme-connector-agent`
2. Create a virtual environment: `python -m venv venv`
3. Install requirements: `pip install -r requirements.txt`
4. Register the connector: `python main.py setup`
5. Test a manual sync: `python main.py sync`
6. Start the daemon for auto-sync: `python main.py start`
