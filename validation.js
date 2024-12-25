const form = document.getElementById('form');
const firstname_input = document.getElementById('firstname-input');
const email_input = document.getElementById('email-input');
const password_input = document.getElementById('password-input');
const error_message = document.getElementById('error-message');

form.addEventListener('submit',(e)=>{
    e.preventDefault()

    let errors = []

    if(firstname_input){
    errors = getSignupFormErrors(firstname_input.value, email_input.value, password_input.value)
    }
    else{
    errors = getLoginFormErrors(email_input.value, password_input.value)
    }
    if(errors.length>0) {
        e.preventDefault()
        error_message.innerText = errors.join(".")
    }
})

    function getSignupFormErrors(firstname, email, password){
    let errors=[]

    if(firstname===''||firstname==null){
    errors.push('Pls put in first name')
    firstname_input.parentElement.classList.add('incorrect')
    }
    if(email===''||email==null){
    errors.push('Pls put in email')
    email_input.parentElement.classList.add('incorrect')
    }
    if(password===''||password==null){
    errors.push('Pls put in password')
    password_input.parentElement.classList.add('incorrect')
    }

    return errors;
}

const allInputs=[firstname_input, email_input, password_input]

allInputs.forEach(input=>{
   input.addEventListener('input',()=>{
       if(input.parentElement.classList.contains('incorrect')){
           input.parentElement.classList.remove('incorrect')
       }
   })
})

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
