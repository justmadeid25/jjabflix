import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA2mbmekWL_GStmWiPsjvFkRPsqY1is97A",
  authDomain: "jjabflix.firebaseapp.com",
  projectId: "jjabflix",
  storageBucket: "jjabflix.firebasestorage.app",
  messagingSenderId: "954295003572",
  appId: "1:954295003572:web:0da98c58721f5f16ba2ae1",
  measurementId: "G-YJWM2BNXGX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
