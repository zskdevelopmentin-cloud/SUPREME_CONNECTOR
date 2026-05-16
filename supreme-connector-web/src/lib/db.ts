import * as admin from 'firebase-admin';

let app;

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Firebase environment variables are missing!');
    app = null;
  } else {
    try {
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error) {
      console.error('Firebase Admin initialization error', error);
      app = null;
    }
  }
} else {
  app = admin.app();
}

export const db = app ? app.firestore() : admin.firestore();
export const fieldValue = admin.firestore.FieldValue;
