import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-gWM4JMMemBXZcW4k86q3vilEEnqno8g",
  authDomain: "promise-9ea68.firebaseapp.com",
  databaseURL: "https://promise-9ea68-default-rtdb.firebaseio.com",
  projectId: "promise-9ea68",
  storageBucket: "promise-9ea68.firebasestorage.app",
  messagingSenderId: "638690517385",
  appId: "1:638690517385:web:a0bb641e919b017a608158",
};

const app = initializeApp(firebaseConfig);
export { app };
export const auth = getAuth(app);
