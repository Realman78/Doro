async function openChat(chatId){
    const res = await fetch('/chats/api/'+chatId)
    const chat = await res.json()
    let imgSrc = ""
    let otherUser = null
    let chatName = ""
    if (!chat.isGroupChat){
        otherUser = chat.users[0]._id == userLoggedIn._id ? chat.users[1] : chat.users[0] 
        imgSrc = otherUser.profilePic
        chatName = otherUser.username
    }else{
        imgSrc = 'https://cdn3.iconfinder.com/data/icons/speech-bubble-2/100/Group-512.png'
        chatName = generateChatName(chat.users)
    }
    chatPhotoImage.src = imgSrc
    chatNameHeader.textContent = chatName
    getMessages(chatId)
}
async function getMessages(chatId){
    const res = await fetch('/chats/api/'+chatId + '/messages')
    const messages = await res.json()

    for (let message of messages){
        messagesList.innerHTML += createMessageHTML(message)
    }
}
function createMessageHTML(message){
    const messageOwner = message.sender._id === userLoggedIn._id ? "mine" : "others"
    return `<li class="message">
        <span class="${messageOwner}">
            <h2>${message.content}</h2>
        </span>
    </li>`
}

messageInput.addEventListener('input', e=>{
    resizeInput()
})
messageInput.addEventListener('keydown', e=>{
    resizeInput()
    if (e.key === "Enter"){
        e.preventDefault()
        messageSendHandler()
    }
})
messageInput.addEventListener('paste', (e)=>{
    e.preventDefault();
    var data = e.clipboardData.getData("text/plain");
    let txt = document.createTextNode(data)
    let selection = document.getSelection()
    if (!selection.rangeCount) return false
    selection.deleteFromDocument()
    selection.getRangeAt(0).insertNode(txt)
    messageInput.focus()
    const val = messageInput.textContent
    messageInput.textContent = ""
    messageInput.textContent = val
    placeCaretAtEnd(messageInput)
    var event = new Event('input', {
        bubbles: true,
        cancelable: true,
    });
    messageInput.dispatchEvent(event)
})

function resizeInput() {
    messageInput.parentNode.parentNode.style.height = ""
    messageInput.parentNode.parentNode.style.height = messageInput.scrollHeight * 2 + "px"
}
function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}
sendMessageButton.addEventListener('click', messageSendHandler)

async function messageSendHandler(){
    const messageContent = messageInput.innerText
    if (messageContent.length > 0){
        const body = JSON.stringify({
            content: messageContent,
            chatId: GchatId
        })
        const res = await fetch('/messages/api', {
            method: "POST",
            body,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const message = await res.json()
        if (!message.error){
            messagesList.innerHTML += createMessageHTML(message)
            messageInput.innerText = ""
        }
    }
}