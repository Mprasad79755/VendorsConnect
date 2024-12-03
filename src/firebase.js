import firebase from 'firebase/compat/app'
import {getAuth} from 'firebase/auth'
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyAvS32zw7t1EimMTMEFG-p30juAm1Knv2k",
  authDomain: "vendors-connect.firebaseapp.com",
  projectId: "vendors-connect",
  storageBucket: "vendors-connect.firebasestorage.app",
  messagingSenderId: "955632958049",
  appId: "1:955632958049:web:9499702969c3caf37b4820"
  };

  

  const app = firebase.initializeApp(firebaseConfig);
  const db = getFirestore(app);



 const auth = getAuth(app)

 export {app , auth , db}