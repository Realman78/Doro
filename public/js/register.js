const registerButton = document.getElementById('registerButton')
const usernameInput = document.getElementById('usernameInput')
const emailInput = document.getElementById('emailInput')
const passwordInput = document.getElementById('passwordInput')
const confirmPasswordInput = document.getElementById('confirmPasswordInput')

confirmPasswordInput.addEventListener('keydown', (e)=>{
    if (e.key == "Enter"){
        registerButton.click()
    }
})

registerButton.addEventListener('click', async (e)=>{
    const username = usernameInput.value
    const email = emailInput.value
    const password = passwordInput.value
    const confirmPassword = confirmPasswordInput.value

    const err = checkForErrors(username, email, password, confirmPassword)
    if (err){
        document.getElementById('errorMessageId').textContent = err
        return;
    }

    const body = JSON.stringify({
        username,
        password,
        email
    })
    const res = await fetch('/users/api/create', {
        method: "POST",
        body,
        headers:{
            'Content-Type': 'application/json'
        }
    }).catch(e=>console.log(e))
    const data = await res.json()
    if (data.error){
        document.getElementById('errorMessageId').textContent = data.error
        return;
    }else{
        window.location.href = '/'
    }
    
})

const checkForErrors = (username, email, password, confirmPassword)=>{
    if (username.length < 3) return "❌Username must contain at least 3 characters"
    if (!validateEmail(email)) return "❌E-mail incorrect"
    if (password.length < 8) return "❌Password must contain at least 8 characters"
    if (password !== confirmPassword) return "❌Passwords don\'t match"
    return null
}

const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };