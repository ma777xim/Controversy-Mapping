const form = document.getElementById('form');
const email = document.getElementById('firstname-input');
const username = document.getElementById('email-input');
const password = document.getElementById('password-input');
const error_message = document.getElementById('error-message');

form.addEventListener('submit',(e)=>{
    e.preventDefault()

    let errors = []

    if(firstname){
    errors = getSignupFormErrors(email.value, username.value, password.value)
    }
    else{
    errors = getLoginFormErrors(email.value, password.value)
    }
    if(errors.length>0) {
        e.preventDefault()
        error_message.innerText = errors.join(".")
    }
})

    function getSignupFormErrors(email, username, password){
    let errors=[]

    if(email===''||email==null){
    errors.push('Pls put in first name')
    firstname_input.parentElement.classList.add('incorrect')
    }
    if(username===''||username==null){
    errors.push('Pls put in email')
    email_input.parentElement.classList.add('incorrect')
    }
    if(password===''||password==null){
    errors.push('Pls put in password')
    password_input.parentElement.classList.add('incorrect')
    }

    return errors;
}

const allInputs=[email, username, password]

allInputs.forEach(input=>{
   input.addEventListener('input',()=>{
       if(input.parentElement.classList.contains('incorrect')){
           input.parentElement.classList.remove('incorrect')
       }
   })
})


//Login and signup form buttons

const signUpButton=document.getElementById('signUpButton')
const signInButton=document.getElementById('signInButton')
const signInForm=document.getElementById('signIn')
const signUpForm=document.getElementById('signUp')

signUpButton.addEventListener('click', function() {
    signInForm.style.display = "none";
    signUpForm.style.display = "block";
});

signInButton.addEventListener('click', function() {
    signInForm.style.display = "block";
    signUpForm.style.display = "none";
});
