// src/firebase/config.js
import { initializeApp } from "firebase/app";

// Only import analytics if you really need it
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAL13dN6XjGq87X-LFeCxerDZpNBOcKxcQ",
  authDomain: "control-panel-c11b7.firebaseapp.com",
  projectId: "control-panel-c11b7",
  storageBucket: "control-panel-c11b7.appspot.com", // ⚠️ fixed `.appspot.com`
  messagingSenderId: "384690286387",
  appId: "1:384690286387:web:946fb6fa5e8abacadbd846",
  measurementId: "G-TBX32PH6RQ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// You can enable Analytics later if you want
// const analytics = getAnalytics(app);
