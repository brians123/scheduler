import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDA-37vp1Ibf5E9ktraiYIZQp-llDFS0Y8",
    authDomain: "schedulerdb-33c8c.firebaseapp.com",
    databaseURL: "https://schedulerdb-33c8c.firebaseio.com",
    projectId: "schedulerdb-33c8c",
    storageBucket: "schedulerdb-33c8c.appspot.com",
    messagingSenderId: "295643298502",
    appId: "1:295643298502:web:8881da3091a42bc36835c7"
  };

firebase.initializeApp(firebaseConfig);

export default firebase;