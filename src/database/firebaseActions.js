import Vue from "vue";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, increment } from "firebase/firestore";
const app = initializeApp({
  apiKey: window.myAPI.getFIREBASEAPIKEY(),
  authDomain: "grapetoolpage.firebaseapp.com",
  databaseURL:
    "https://grapetoolpage-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "grapetoolpage",
  storageBucket: "grapetoolpage.appspot.com",
  messagingSenderId: "1090340650285",
  appId: "1:1090340650285:web:3304c766080018bde167a4",
});
const db = getFirestore();

export function updateStats(statistic, amount) {
    const usage = doc(db, "meta", "usage");
    updateDoc(usage,{[statistic] : increment(amount)})
    console.log("updated", statistic, amount)
  } 