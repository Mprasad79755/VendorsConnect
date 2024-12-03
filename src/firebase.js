import firebase from 'firebase/compat/app'
import {getAuth} from 'firebase/auth'
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
    apiKey: "AIzaSyAUwz6d51f64wcYoHNUl8VN3NbVR5SahNQ",
  authDomain: "diplomax-dtek.firebaseapp.com",
  databaseURL: "https://diplomax-dtek-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "diplomax-dtek",
  storageBucket: "diplomax-dtek.appspot.com",
  messagingSenderId: "280311422829",
  appId: "1:280311422829:web:6b3195246c43eb925b0464",
  measurementId: "G-WGQ3MK27DQ"
  };

  

  const app = firebase.initializeApp(firebaseConfig);
  const db = getFirestore(app);



 const auth = getAuth(app)

 export {app , auth , db}