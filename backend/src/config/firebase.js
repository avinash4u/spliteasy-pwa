import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Check if Firebase credentials are properly configured
const hasValidCredentials = 
  process.env.FIREBASE_PROJECT_ID && 
  process.env.FIREBASE_CLIENT_EMAIL && 
  process.env.FIREBASE_PRIVATE_KEY && 
  !process.env.FIREBASE_PRIVATE_KEY.includes('Copy-entire-private-key-from-firebase-json-here');

if (hasValidCredentials && !admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
  console.log('✅ Firebase Admin SDK initialized');
} else {
  console.log('⚠️  Firebase Admin SDK skipped - credentials not properly configured');
  console.log('   To enable Firebase authentication, update your .env file with valid service account credentials');
}

export const auth = hasValidCredentials ? admin.auth() : null;
export const firestore = hasValidCredentials ? admin.firestore() : null;

export default admin;
