/**
 * Firebase Admin Configuration
 * Used for authentication verification and Firestore real-time features
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Parse the private key (handles escaped newlines)
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    console.log('✓ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('✗ Firebase Admin initialization failed:', error);
    throw error;
  }
};

// Initialize Firebase
if (!admin.apps.length) {
  initializeFirebase();
}

// Export Firebase services
export const auth = admin.auth();
export const firestore = admin.firestore();
export const storage = admin.storage();
export const messaging = admin.messaging();

// Verify Firebase ID token
export const verifyIdToken = async (idToken: string) => {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
};

// Send push notification via FCM
export const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  data?: { [key: string]: string }
) => {
  try {
    const message = {
      notification: { title, body },
      data: data || {},
      token,
    };

    const response = await messaging.send(message);
    console.log('Push notification sent:', response);
    return response;
  } catch (error) {
    console.error('Failed to send push notification:', error);
    throw error;
  }
};

// Firestore helper: Get pair's real-time data
export const getPairRealTimeData = (pairId: string) => {
  return firestore.collection('pairs').doc(pairId);
};

// Firestore helper: Set user presence
export const setUserPresence = async (pairId: string, userId: string, online: boolean) => {
  const presenceRef = firestore
    .collection('pairs')
    .doc(pairId)
    .collection('presence')
    .doc(userId);

  await presenceRef.set({
    online,
    lastSeen: admin.firestore.FieldValue.serverTimestamp(),
  });
};

export default admin;
