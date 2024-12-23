import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {getAuth, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import{getFirestore, getDoc, doc} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js"

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
const db = getFirestore();    };

    onAuthStateChanged(auth, (user)=>{
        const loggedInUserId=localStorage.getItem('loggedInUserId');
        if(loggedInUserId){
                console.log(user);
                const docRef = doc(db, "mappers", loggedInUserId);
                getDoc(docRef)
                .then((docSnap)=>{
                        if(docSnap.exists()){
                                const userData=docSnap.data();
                                document.getElementById('email').innerText=userData.email;
                                document.getElementById('username').innerText=userData.username;
                        }
                        else{
                                console.log("bruh doesn't exist")
                        }
                })
                .catch((error)=>{
                        console.log("Bruh");
                })
        }
        else{
                console.log("Nothing")
        }
    })

    const logoutButton=document.getElementById('logout');

    logoutButton.addEventListener('click',()=>{
        localStorage.removeItem('loggedInUserId');
        signOut(auth)
        .then(()=>{
                window.location.href='index.html';
        })
        .catch((error)=>{
                console.error('Error Signing out:', error);
        })
    })