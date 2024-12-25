// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB3Vn9jXSJnQ0XC8JM64OszHpNEkvViBxA",
    authDomain: "mapping-controversies.firebaseapp.com",
    projectId: "mapping-controversies",
    storageBucket: "mapping-controversies.appspot.com",
    messagingSenderId: "259825186402",
    appId: "1:259825186402:web:7c38048d67546fbe9b833b",
    measurementId: "G-Q0WM4CNVM4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

const form = document.getElementById('form');
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent page refresh

    // Inputs
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        // Sign in with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Store email locally
        localStorage.setItem('email', email);

        // Redirect on successful login
        alert("Yay.");
        window.location.href = "dashboard2.html"; // Replace with your desired page
    } catch (error) {
        console.error("Login error:", error.code, error.message);
        alert(`Login failed: ${error.message}`);
    }
});
