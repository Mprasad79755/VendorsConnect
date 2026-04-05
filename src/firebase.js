import firebase from 'firebase/compat/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyAGRtBunWs7sfp0R5tuOT--g5RECYFzjFI",
  authDomain: "vendorgo-74994.firebaseapp.com",
  projectId: "vendorgo-74994",
  storageBucket: "vendorgo-74994.firebasestorage.app",
  messagingSenderId: "757829392579",
  appId: "1:757829392579:web:bb4625e8edffef90376a76",
  measurementId: "G-3DMV5S46E0"
};



const app = firebase.initializeApp(firebaseConfig);
const db = getFirestore(app);



const auth = getAuth(app)

export { app, auth, db }