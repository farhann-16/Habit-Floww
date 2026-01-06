import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase Web App configuration
const firebaseConfig = {
    apiKey: "AIzaSyDeRLuuAHOTf3Rpnkoz4r-9pM-tRzMp8iw",
    authDomain: "habit-flow-846da.firebaseapp.com",
    projectId: "habit-flow-846da",
    storageBucket: "habit-flow-846da.firebasestorage.app",
    messagingSenderId: "900426522202",
    appId: "1:900426522202:web:3d9efa8346c50a9e500263"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
