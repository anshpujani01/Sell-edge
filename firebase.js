// Firebase Configuration
// Get these values from your Firebase Console: https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: "AIzaSyBYe05TmBzh1-f3arisvhpSk5fG9xY8_4A",
  authDomain: "velvettrim-6da3a.firebaseapp.com",
  projectId: "velvettrim-6da3a",
  storageBucket: "velvettrim-6da3a.appspot.com",
  messagingSenderId: "357069133185",
  appId: "1:357069133185:web:ed0068ef6454cc43744480",

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Now Firestore & Storage are available
const db = firebase.firestore();
const storage = firebase.storage();

console.log('✅ Firebase initialized');
// Check if config has been updated
if (firebaseConfig.apiKey === "AIzaSyBYe05TmBzh1-f3arisvhpSk5fG9xY8_4A) {
    console.warn('⚠️ Firebase configuration not updated! Please update firebase-config.js with your Firebase project details.');
    alert('⚠️ Firebase is not configured!\n\nPlease:\n1. Go to https://console.firebase.google.com/\n2. Get your Firebase config\n3. Update firebase-config.js\n4. Refresh this page');
}

// Initialize Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized successfully!');
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    alert('Firebase initialization failed: ' + error.message);
}

// Initialize Firebase services with error handling
let db, storage, auth;

try {
    db = firebase.firestore();
    storage = firebase.storage();
    auth = firebase.auth();
    
    // Enable offline persistence
    db.enablePersistence().catch((err) => {
        if (err.code == 'failed-precondition') {
            console.log('Multiple tabs open - offline persistence disabled');
        } else if (err.code == 'unimplemented') {
            console.log('Browser not supported for offline persistence');
        }
    });
    
    console.log('✅ Firebase services initialized: Firestore, Storage, Auth');
} catch (error) {
    console.error('❌ Error initializing Firebase services:', error);
    alert('Error initializing Firebase services: ' + error.message);
}