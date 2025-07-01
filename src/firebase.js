// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { config } from '../secrets';

// const firebaseConfig = {
//   apiKey: config.VITE_FIREBASE_API_KEY,
//   authDomain: config.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: config.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: config.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: config.VITE_FIREBASE_MESSAGE_SENDER_ID,
//   appId: config.VITE_FIREBASE_APP_ID,
//   measurementId: config.VITE_FIREBASE_MEASUREMENT_ID
// };

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
//   measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// export { db };