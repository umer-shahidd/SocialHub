// services/firebase.js
import { firebase } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Initialize Firebase with google-services.json
if (!firebase.apps.length) {
  firebase.initializeApp({});
}

// Export services
export const authInstance = auth();
export const firestoreInstance = firestore();
export const storageInstance = storage();

// Export common methods
export const onAuthStateChanged = auth().onAuthStateChanged;
export const signOut = auth().signOut;
export const collection = firestore().collection;
export const query = firestore().query;
export const where = firestore().where;
export const orderBy = firestore().orderBy;
export const getDocs = firestore().getDocs;
export const doc = firestore().doc;
export const getDoc = firestore().getDoc;
export const setDoc = firestore().setDoc;
export const updateDoc = firestore().updateDoc;
export const increment = firestore.FieldValue.increment;
export const addDoc = firestore().addDoc;
export const deleteDoc = firestore().deleteDoc;
export const writeBatch = firestore().writeBatch;
export const ref = storage().ref;
export const uploadBytes = storage().uploadBytes;
export const getDownloadURL = storage().getDownloadURL;
export const deleteObject = storage().deleteObject;
export const serverTimestamp = firestore.FieldValue.serverTimestamp;