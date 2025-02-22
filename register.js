// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
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

// Form submission handling
const form = document.getElementById('form');
if (form) {
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent form refresh

        // Get inputs safely
        const emailInput = document.getElementById('email');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const genderInput = document.getElementById('gender');

        if (!emailInput || !usernameInput || !passwordInput || !genderInput) {
            console.error("One or more form elements are missing.");
            return;
        }

        const email = emailInput.value.trim();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const gender = genderInput.value;

        if (!email || !username || !password || !gender) {
            alert("All fields are required!");
            return;
        }

        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Signed-in user:", user);

            // Save additional user data in Firestore
            const userData = {
                email: email,
                username: username,
                gender: gender,
                createdAt: new Date().toISOString() // Track account creation time
            };
            await setDoc(doc(db, "mappers", user.uid), userData);

            // Redirect to another page
            localStorage.setItem('username', username);
            alert("Hey " + username + ", you are ready to make controversies!");
            window.location.href = "dashboard.html";

        } catch (error) {
            console.error("Error creating user:", error.code, error.message);
            alert(`Error: ${error.message}`);
        }
    });
} else {
    console.error("Form element with id 'form' not found.");
}
