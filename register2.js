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
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent form refresh


    // Get inputs
    const zip = document.getElementById('zip').value;
    const job = document.getElementById('job').value;
    const age = document.getElementById('age').value;

    // Submit data to Firebase
submit.addEventListener("click", async () => {
    const value = popupInput.value.trim(); // Get the user input


    if (value && currentField) {
        try {
            // Check if the user is logged in
            const user = auth.currentUser;
            if (!user) throw new Error("No logged-in user.");

            // Get the user's document in Firestore
            const userRef = doc(db, "mappers", user.uid);

            // Update the field in the Firestore document
            await updateDoc(userRef, { [currentField]: value });

            alert(`${currentField} has been updated to: ${value}`);
        } catch (error) {
            console.error("Error updating document:", error);
            alert("Failed to update the field.");
        }
    } else {
        alert("Please provide a valid input.");
    }
)};