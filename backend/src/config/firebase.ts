import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

let firebaseInitialized = false;

if (!admin.apps.length) {
  try {
    // ✅ Load directly from JSON file
    const serviceAccount = JSON.parse(
      readFileSync(join(__dirname, '../../firebase-service-account.json'), 'utf-8')
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firebaseInitialized = true;
    console.log('✅ Firebase initialized successfully');
  } catch (err: unknown) {
    console.error('❌ Firebase init failed:', (err as Error).message);
    console.warn('⚠️  Push notifications disabled');
  }
}

export const sendPushNotification = async (
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> => {
  if (!fcmToken || !firebaseInitialized) {
    console.warn('⚠️  Skipping push — Firebase not ready or no token');
    return;
  }

  try {
    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: { title, body },
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
      ...(data && { data }),
    };

    await admin.messaging().send(message);
    console.log('✅ Push notification sent');
  } catch (err: unknown) {
    console.error('❌ Push notification failed:', (err as Error).message);
  }
};