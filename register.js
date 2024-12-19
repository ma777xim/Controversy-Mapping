// Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
    import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
    import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyB3Vn9jXSJnQ0XC8JM64OszHpNEkvViBxA",
        authDomain: "mapping-controversies.firebaseapp.com",
        projectId: "mapping-controversies",
        storageBucket: "mapping-controversies.firebasestorage.app",
        messagingSenderId: "259825186402",
        appId: "1:259825186402:web:7c38048d67546fbe9b833b",
        measurementId: "G-Q0WM4CNVM4"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);



    // submit
    const submit = document.getElementById('submit');
    submit.addEventListener("click",function(event){
        // inputs
        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

    event.preventDefault()



    const auth = getAuth();
createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        alert(Mhm nice its working)
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(Mhm nice it worked)
    });
})