import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBBLtKxgcDonJ-SLqCbOnmVAakz2NyUHIY",
  authDomain: "tarefasplus-65782.firebaseapp.com",
  projectId: "tarefasplus-65782",
  storageBucket: "tarefasplus-65782.firebasestorage.app",
  messagingSenderId: "676322470762",
  appId: "1:676322470762:web:0c94c010f3144c9abd5313"
};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

export { db };