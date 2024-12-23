// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
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

// Form submission handling
const form = document.getElementById('form');
form.addEventListener('click', (event)=>{
    event.preventDefault(); // Prevent form refresh

    // Inputs
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value; // Currently unused, but can be stored in Firestore
    const password = document.getElementById('password').value;

    const auth=getAuth();
    const db=getFirestore();

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential)=>{
        const user=userCredential.user;
        const userData={
            email: email,
            username: username,
            password: password
        };
        const docRef=doc(db, "mappers", mappers.uid);
        setDoc(docRef,userData)
        .then(()=>{
            window.location.href='index.html'
        })
    })

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        alert("Mhm nice it's working");
        console.log("User created:", user);
        window.location.href = "login.html";
    } catch (error) {
        console.error("Error creating user:", error.code, error.message);
        alert(Error: ${error.message});
    }
});
