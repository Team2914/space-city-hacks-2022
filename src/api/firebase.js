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
  setDoc,
} from "firebase/firestore";
import { getDatabase, onDisconnect, ref, set } from "firebase/database";
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
const realtime = getDatabase();
const gamesRef = collection(db, "games");
const onlineRef = collection(db, "online");

export const authenticateAnonymously = () => {
  return signInAnonymously(getAuth(app));
};

export const online = (uid) => {
  return onDisconnect(ref(realtime, "users/" + uid))
    .set({ online: false })
    .then(() =>
      set(ref(realtime, "users/" + uid), {
        online: true,
      })
    );
};

export const setUserOnline = (uid) => {
  return setDoc(doc(onlineRef, uid), { timeStamp: serverTimestamp() });
};

export const getOnline = () => {
  return getDocs(onlineRef);
};

export const removeOnline = (uid) => {
  console.log("removing online");
  return deleteDoc(doc(onlineRef, uid));
};

export const createGame = () => {
  return addDoc(gamesRef, {
    created: serverTimestamp(),
  });
};

export const getGameListener = (callback) => {
  const q = query(gamesRef);
  return onSnapshot(q, callback);
};
