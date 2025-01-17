import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore"
import { getAuth,GoogleAuthProvider } from "firebase/auth"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBCY6l4AGAroU0jKDReAj3N_BJTsw5KgOo",
  authDomain: "linechatapp-621b7.firebaseapp.com",
  projectId: "linechatapp-621b7",
  storageBucket: "linechatapp-621b7.firebasestorage.app",
  messagingSenderId: "906763622951",
  appId: "1:906763622951:web:d272a4b2f5dde3dab3cc02"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export {auth,db,provider}
