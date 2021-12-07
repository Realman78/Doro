// const nameInput = document.getElementById('nameInput')
// const ih = document.getElementById('imageHolder')
// setTimeout(()=>{
//     if (window.ethereum){
//         if (ethereum.isConnected()){
//             if (!ethereum.selectedAddress){
//                 ethereum.enable().then(()=>{
//                     getAssetsById(ethereum.selectedAddress)
//                 })
//             }else{
//                 getAssetsById(ethereum.selectedAddress)
//             }
//         }else{
//             console.log('ok wtf')
//         }
//     }else{
//         console.log('nooooo')
//     }
// }, 1000)

// async function getAssetsById(id){
//     const res = await fetch(`https://api.opensea.io/api/v1/assets?owner=${id}&order_direction=desc&offset=0&limit=20`)
//     const data = await res.json()
//     console.log(data)
//     for (let asset of data.assets){
//         let html = `<img src=${asset.image_url} alt="Nani?"/>`
//         ih.innerHTML += html
//     }
// }
// nameInput.addEventListener('keydown', (e)=>{
//     if (e.key === 'Enter'){
//         getAssetsById(e.target.value)
//     }
// })


const addFriendButton = document.getElementById('addFriendButton')
const addFriendModal = document.getElementById('addFriendModal')
const newChatModal = document.getElementById('newChatModal')
const addFriendSearchbox = document.getElementById('addFriendSearchbox')
const newChatSearchbox = document.getElementById('newChatSearchbox')
const availableUsersDiv = document.querySelector('.availableUsers')
const modalMessageBox = document.querySelector('.modalMessageBox')
const noUsersFoundSearch = document.getElementById('noUsersFoundSearch')
const newMessageButton = document.getElementById('newMessageButton')
const availableUsersNewChat = document.getElementById('availableUsersNewChat')
const noUsersFoundSearchNewChat = document.getElementById('noUsersFoundSearchNewChat')
const selectedUsersNumberP = document.getElementById('selectedUsersNumber')

let selectedUsersNumber = 0
let selectedUsers = []

addFriendModal.addEventListener('click', (e)=>{
    if (e.target === addFriendModal){
        addFriendModal.style.display = "none"
        addFriendSearchbox.value = ''
        availableUsersDiv.innerHTML = ''
        noUsersFoundSearch.style.display = "none"
        selectedUsersNumber = 0
        selectedUsers = []
        return;
    }
})
let typingTimer;
addFriendSearchbox.addEventListener('keyup', searchBoxListener.bind(this, null))
newChatSearchbox.addEventListener('keyup', searchBoxListener.bind(this, "new-chat"))

function searchBoxListener(type, e){
    if (typingTimer) clearTimeout(typingTimer)
    typingTimer = setTimeout(()=>{
        if(e.target.value.length > 0 || type === 'new-chat')
            getUsersByUsername(e.target.value, type)
        else{
            if (!type) noUsersFoundSearch.style.display = "block"
            availableUsersDiv.innerHTML = ''
            availableUsersNewChat.innerHTML = ''
        }
    },1200)
}

addFriendButton.addEventListener('click', (e)=>{
    noUsersFoundSearch.style.display = "none"
    addFriendModal.style.display = "block"
    addFriendSearchbox.focus()
})

const getUsersByUsername = async (username, type = null)=>{
    if (!username && !type){
        noUsersFoundSearch.style.display = "block"
        availableUsersDiv.innerHTML = ''
        return
    }
    let res,data;
    if (!type){
        res = await fetch('/users/api/get?phrase='+username)
        data = await res.json()
        noUsersFoundSearch.style.display = data.length < 1 ? "block" : "none"
        availableUsersDiv.innerHTML = ''
        
    }
    else if(type==="new-chat"){
        if (!username) data = userLoggedIn.comrades
        else data = userLoggedIn.comrades.filter(comrade=>{
            return comrade.username.toLowerCase().includes(username.toLowerCase()) || selectedUsers.includes(comrade._id)
        })
        availableUsersNewChat.innerHTML = ''
        noUsersFoundSearchNewChat.style.display = data.length < 1 ? "block" : "none"
    }
    let i = 0;
    for (let user of data) {
        if (i++ < 50)
            createUserPreview(user, type)
    }
    if (type === 'new-chat') {
        newChatUserClickHandler()
        return
    }

    document.querySelectorAll('.addFriendButton').forEach(btn=>{
        btn.addEventListener('click', async (e)=>{
            const selectedUserId = e.target.parentNode.attributes["data-id"].value.toString()
            const body = JSON.stringify({
                userId: selectedUserId
            })
            const res = await fetch('/users/api/friends/modify', {
                method: "PUT",
                body,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            const data = await res.json()
            userLoggedIn = data
            if (data){
                let isComrade = false;
                for (let cUser of userLoggedIn.comrades){
                    if (cUser._id.toString() === selectedUserId){
                        isComrade = true
                        break;
                    }
                }
                action = isComrade ? `<i class="fas fa-user-check"></i>` : `<i class="fas fa-user-plus"></i>`
                e.target.innerHTML = action
            }
        })
    })
}
const createUserPreview = (user, type)=>{
    let action, classes = "", classes2 = ""
    switch(type){
        case null:
            let isComrade = false;
            for (let cUser of userLoggedIn.comrades){
                if (cUser._id.toString() === user._id){
                    isComrade = true
                    break;
                }
            }
            action = isComrade ? `<i class="fas fa-user-check"></i>` : `<i class="fas fa-user-plus"></i>`
            classes="addFriendButton"
            break;
        case 'new-chat':
            if (selectedUsers.includes(user._id)){
                classes2 = "selectedUserPreview"
                action = `<i class="fas fa-check-square"></i>`
            }else action = `<i class="far fa-square"></i>`
            classes="addFriendToChatButton"
            classes2 += " preventClicks"
            break;
    }
    let html = `<div class="userPreview ${classes2}" data-id="${user._id}">
            <div class="userPreviewContent">
                <img src="${user.profilePic}" alt="ProfilePic">
                <h3 class="ellipsis">${user.username}</h3>
            </div>
            <button class="${classes}">${action}</button>
        </div>`
    if(!type){
        availableUsersDiv.innerHTML += html
    }else if(type == 'new-chat'){
        availableUsersNewChat.innerHTML += html
    }
}

newChatModal.addEventListener('click', (e)=>{
    if (e.target === newChatModal){
        newChatModal.style.display = "none"
        noUsersFoundSearch.style.display = "none"
        selectedUsersNumber = 0
        selectedUsers = []
        selectedUsersNumberP.textContent = `Selected users: ${selectedUsersNumber}`
        newChatSearchbox.value = ''
        modalMessageBox.style.display = 'none'
        return;
    }
})
newMessageButton.addEventListener('click',(e)=>{
    newChatModal.style.display = "block"
    availableUsersNewChat.innerHTML = ''
    let i = 0;
    for (let comrade of userLoggedIn.comrades){
        if (i++ < 50)
            createUserPreview(comrade, 'new-chat')
    }
    newChatUserClickHandler()
})

function newChatUserClickHandler(){
    document.querySelectorAll('.userPreview').forEach(div=>{
        div.addEventListener('click', e=>{
            const selectedUserId = e.target.attributes['data-id'].value.toString()
            const containsUser = selectedUsers.findIndex(user=>user===selectedUserId)
            if (containsUser == -1){
                e.target.classList.add('selectedUserPreview')
                selectedUsers.push(selectedUserId)
                selectedUsersNumber++;
                e.target.getElementsByTagName('button')[0].innerHTML = `<i class="fas fa-check-square"></i>`
            }
            else {
                selectedUsers.splice(containsUser, 1);
                e.target.classList.remove('selectedUserPreview')
                selectedUsersNumber--;
                e.target.getElementsByTagName('button')[0].innerHTML = `<i class="far fa-square"></i>`
            }
            modalMessageBox.style.display = selectedUsersNumber > 0 ? "block" : "none"
            selectedUsersNumberP.textContent = `Selected users: ${selectedUsersNumber}`
        })
    })
}