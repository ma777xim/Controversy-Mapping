// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB3VnQ0XC8JM64OszHpNEkvViBxA",
    authDomain: "mapping-controversies.firebaseapp.com",
    databaseURL: "https://mapping-controversies-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mapping-controversies",
    storageBucket: "mapping-controversies.appspot.com",
    messagingSenderId: "259825186402",
    appId: "1:259825186402:web:7c38048d67546fbe9b833b",
    measurementId: "G-Q0WM4CNVM4"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Track user state
let currentUser = null;

// Check if the user is logged in
onAuthStateChanged(auth, user => {
    if (user) {
        currentUser = user; // Logged-in user
    } else {
        currentUser = null;
        alert("U need to log in to do that.");
    }
});

// Show the corresponding form on button click
document.querySelectorAll(".sidebar button").forEach(button => {
    button.addEventListener("click", () => {
        if (!currentUser) {
            alert("Pls login first.");
            return;
        }

        const field = button.id.replace("btn-", "form-");
        document.querySelectorAll(".form").forEach(form => form.classList.add("hidden"));
        document.querySelector(`#${field}`).classList.remove("hidden");
        document.querySelector(".forms-container").style.display = "block";
    });
});

// Handle form submission
document.querySelectorAll(".form .submit").forEach(submitButton => {
    submitButton.addEventListener("click", async () => {
        if (!currentUser) {
            alert("Pls log in first");
            return;
        }

        const field = submitButton.dataset.field;
        const input = document.querySelector(`#${field}-input`).value.trim();

        if (!input) {
            alert("Dude, u didnt enter anything.");
            return;
        }

        try {
            const userDoc = doc(db, "mappers", currentUser.uid);
            await updateDoc(userDoc, {
                [field]: input
            });

            alert(`${field} added.`);
        } catch (error) {
            console.error("Error updating field:", error);
            alert("No worko! Can u try again?");
        }

        // Clear input and hide form
        document.querySelector(`#${field}-input`).value = "";
        document.querySelector(`#form-${field}`).classList.add("hidden");
        document.querySelector(".forms-container").style.display = "none";
    });
});
