const loginButton = document.getElementById('loginButton')
const uoeInput = document.getElementById('uoeInput')
const passwordInput = document.getElementById('passwordInput')

passwordInput.addEventListener('keydown', (e)=>{
    if (e.key == "Enter"){
        loginButton.click()
    }
})

loginButton.addEventListener('click', async (e)=>{
    const uoe = uoeInput.value
    const password = passwordInput.value
    const body = JSON.stringify({
        uoe,
        password
    })
    const res = await fetch('/users/api/login', {
        method: "POST",
        body,
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const data = await res.json()
    if (data.error){
        document.getElementById('errorMessageId').textContent = data.error
        return;
    }else{
        window.location.href = '/'
    }
    
})