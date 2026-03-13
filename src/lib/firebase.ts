import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCgPww2i15SPqZncEdWbQaFmN8HpY2CUt0",
    authDomain: "missolucionesia.firebaseapp.com",
    projectId: "missolucionesia",
    storageBucket: "missolucionesia.firebasestorage.app",
    messagingSenderId: "891161543441",
    appId: "1:891161543441:web:0855fa77b3ece3aca9c2b0",
    measurementId: "G-KGD6BV0QES"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
