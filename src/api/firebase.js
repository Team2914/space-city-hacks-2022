import { initializeApp } from "firebase/app";
import {
  getFirestore,
  query,
  orderBy,
  onSnapshot,
  collection,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  arrayUnion,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDryRbxD236gxgz3nhJxpb7YuSBnTQbYNk",
  authDomain: "space-city-hacks.firebaseapp.com",
  projectId: "space-city-hacks",
  storageBucket: "space-city-hacks.appspot.com",
  messagingSenderId: "45106253308",
  appId: "1:45106253308:web:352c828e9b3296f6b67679",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const gamesRef = collection(db, "games");
const onlineRef = collection(db, "online");

export const authenticateAnonymously = () => {
  return signInAnonymously(getAuth(app));
};

export const addUserOnline = (uid) => {
  return addDoc(onlineRef, {
    id: uid,
  });
};

export const getOnline = () => {
  return getDocs(onlineRef);
};

export const removeOnline = (uid) => {
  return deleteDoc(doc(onlineRef, uid));
};

export const createGame = () => {
  return addDoc(gamesRef, {
    created: serverTimestamp(),
  });
};
