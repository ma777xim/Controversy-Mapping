// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

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

// Form submission logic
const form = document.getElementById('form');
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent page reload

    // Get user input
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Clear error message
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = "";

    try {
        // Firebase sign-in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Get user info
        const user = userCredential.user;

        // Fetch username from Firestore (if stored)
        const userDoc = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
            const username = userSnapshot.data().username || "User";
            localStorage.setItem('username', username); // Store username locally
            alert(`Welcome, ${username}!`);
        } else {
            console.warn("No username found in Firestore. Storing default.");
            localStorage.setItem('username', "User");
        }

        // Redirect to dashboard
        window.location.href = "dashboard2.html";
    } catch (error) {
        console.error("Login error:", error.code, error.message);
        errorMessage.textContent = `Error: ${error.message}`;
    }
});
