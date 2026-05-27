import Constants from 'expo-constants';

// Use the API URL defined in app.config.js (extra.API_URL).
// If running on an Android emulator, `10.0.2.2` points to the host machine.
const base = Constants.expoConfig?.extra?.API_URL?.replace('/api', '') ||
  (Constants.platform?.android ? 'http://10.0.2.2:5000' : 'http://localhost:5000');

export const API_BASE_URL = `${base}/api`;
export const SOCKET_URL = base;
export const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_KEY';