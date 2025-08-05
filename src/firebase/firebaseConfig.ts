import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCEU505jxVhflPrCwbn0YtWYDJ-x1M2TLY",
  authDomain: "ai-proctored.firebaseapp.com",
  projectId: "ai-proctored",
  storageBucket: "ai-proctored.firebasestorage.app",
  messagingSenderId: "490339358193",
  appId: "1:490339358193:web:44f005a3deacbf02e62050",
  measurementId: "G-EJ0C6WPVXM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);


