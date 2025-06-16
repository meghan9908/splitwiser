// Firebase configuration and initialization for Splitwiser app
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyC4Ny4BSh3q4fNEVBGyw2u_FvLaxXukB8U",
  authDomain: "splitwiser-25e34.firebaseapp.com",
  projectId: "splitwiser-25e34",
  storageBucket: "splitwiser-25e34.firebasestorage.app",
  messagingSenderId: "323312632683",
  appId: "1:323312632683:web:eef9ca7acc5c5a89ce422e",
  measurementId: "G-SDY9ZRV9V4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };

