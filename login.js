// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB3Vn9jXSJnQ0XC8JM64OszHpNEkvViBxA",
    authDomain: "mapping-controversies.firebaseapp.com",
    databaseURL: "https://mapping-controversies-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mapping-controversies",
    storageBucket: "mapping-controversies.firebasestorage.app",
    messagingSenderId: "259825186402",
    appId: "1:259825186402:web:7c38048d67546fbe9b833b",
    measurementId: "G-Q0WM4CNVM4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// Form submission handling
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent page refresh

    // Inputs
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Find user by username in Firestore
        const usersQuery = query(
            collection(db, "mappers"),
            where("username", "==", username)
        );
        const querySnapshot = await getDocs(usersQuery);

        if (querySnapshot.empty) {
            throw new Error("check username pls");
        }

        // Get user's email
        const userDoc = querySnapshot.docs[0]; // Assuming usernames are unique
        const userData = userDoc.data();
        const email = userData.email;

        // Sign in with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        //Store username
localStorage.setItem('username', userData.username);

        // Redirect on successful login
        alert("Yay!");
        window.location.href = "dashboard.html"; // Replace with your desired page
    }

    catch (error) {
        console.error("Nope.", error.code, error.message);
        alert(`Error: ${error.message}`);
    }
});
