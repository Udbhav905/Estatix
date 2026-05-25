import admin from 'firebase-admin';

// For production, store the service account JSON in env variable
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.warn('Firebase not configured. Push notifications disabled.');
  }
}

export const sendPushNotification = async (fcmToken: string, title: string, body: string, data?: any) => {
  if (!fcmToken || !admin.apps.length) return;
  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: data ? JSON.parse(JSON.stringify(data)) : undefined,
    });
  } catch (error) {
    console.error('Push notification failed:', error);
  }
};