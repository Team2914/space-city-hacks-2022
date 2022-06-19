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
import {
  get,
  getDatabase,
  onDisconnect,
  onValue,
  ref,
  set,
  update,
} from "firebase/database";
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

const NUM_ROUNDS = 6;

export const authenticateAnonymously = () => {
  return signInAnonymously(getAuth(app));
};

export const online = (uid) => {
  return onDisconnect(ref(realtime, "users/" + uid))
    .update({ online: false })
    .then(() =>
      update(ref(realtime, "users/" + uid), {
        online: true,
      })
    );
};

export const setUserOnline = (uid) => {
  return setDoc(doc(onlineRef, uid), { timeStamp: serverTimestamp() });
};

export const trackUser = (uid, callback) => {
  return onValue(ref(realtime, "users/" + uid), (snapshot) => {
    callback(snapshot.val());
  });
};

export const getOnline = (callback) => {
  return onValue(ref(realtime, "users"), (snapshot) => {
    if (snapshot.exists) {
      let snap = snapshot.val();
      let users = Object.keys(snap);
      callback(users.filter((i) => snap[i].online));
    } else {
      callback([]);
    }
  });
};

export const createGame = (players, i, rounds) => {
  let prompt = "Fake Prompt To Be Replaced"; //will be replaced with actual prompt generator

  return addDoc(gamesRef, {
    prompts: [prompt],
    code: [],
    players,
    index: i,
    rounds,
  });
};

export const setUserGame = (uid, gameID) => {
  return update(ref(realtime, "users/" + uid), { game: gameID });
};

export const setUsersGame = (uids, gameID) => {
  let promises = uids.map((uid) => setUserGame(uid, gameID));
  return Promise.all(promises);
};

export const getGameListener = (callback) => {
  const q = query(gamesRef);
  return onSnapshot(q, callback);
};

export const updateGame = (id, data) => {
  delete data.id;
  return updateDoc(doc(gamesRef, id), data);
};
