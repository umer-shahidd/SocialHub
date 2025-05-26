import { initializeApp } from '@react-native-firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyDWS6cNsywar5mLgafxsqiJHwmZUzCBiKg",
  authDomain: "socialapp-26571.firebaseapp.com",
  projectId: "socialapp-26571",
  storageBucket: "socialapp-26571.appspot.com",
  messagingSenderId: "278085694099",
  appId: "1:278085694099:android:7cd6e8fb33e5282b14d366"
};

// Initialize Firebase
if (!initializeApp().length) {
  initializeApp(firebaseConfig);
}

export { firebaseConfig };