import admin from 'firebase-admin';

// For production, store the service account JSON in env variable
if (!admin.apps.length) {
  try {
    let serviceAccountStr = (process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}').trim();
    
    // If the JSON string is wrapped in leading/trailing double quotes, strip them
    if (serviceAccountStr.startsWith('"') && serviceAccountStr.endsWith('"')) {
      serviceAccountStr = serviceAccountStr.slice(1, -1);
    }
    
    const serviceAccount = JSON.parse(serviceAccountStr);
    
    // Only initialize if we got valid service account keys
    if (serviceAccount && serviceAccount.project_id) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('🔥 Firebase admin initialized successfully.');
    } else {
      console.warn('📢 Info: Firebase credentials not set or incomplete. Push notifications disabled.');
    }
  } catch (error: any) {
    console.warn('📢 Info: Firebase credentials not fully configured or JSON is invalid. Push notifications disabled.');
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