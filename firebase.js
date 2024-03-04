  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDeu_2XzSJSnF_0UDCSwol5w2FuSP2pOQM",
    authDomain: "test-21f28.firebaseapp.com",
    databaseURL: "https://test-21f28-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "test-21f28",
    storageBucket: "test-21f28.appspot.com",
    messagingSenderId: "666260852208",
    appId: "1:666260852208:web:ba8a4085d56f30d0bfa135"
};

firebase.initializeApp(config);
            const auth = firebase.auth();
            const db = firebase.firestore();
            //const database =firebase.database(); //real time database
            db.settings({ timestampsInSnapshots: true }); 

            // Get a reference to the Firebase authentication service
          //  const auth = firebase.auth();

            // Get a reference to the Firebase Realtime Database service
            //const database = firebase.database();
