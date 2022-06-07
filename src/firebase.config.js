// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyC0FolCUS46nMv5sIqG_IVS01xiXMM2ygg",
  authDomain: "marketplace-75d5e.firebaseapp.com",
  projectId: "marketplace-75d5e",
  storageBucket: "marketplace-75d5e.appspot.com",
  messagingSenderId: "789176675742",
  appId: "1:789176675742:web:e9c3e1826fa8df0580fa8f",
  measurementId: "G-CLQHFFQGKD",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore()
const analytics = getAnalytics(app)
