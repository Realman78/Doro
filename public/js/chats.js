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
    await getMessages(chatId)
    var event = new Event('input', {
        bubbles: true,
        cancelable: true,
    });
    messageInput.dispatchEvent(event)
}
async function getMessages(chatId){
    const res = await fetch('/chats/api/'+chatId + '/messages')
    const messages = await res.json()
    
    for (let message of messages){
        messagesList.innerHTML += await createMessageHTML(message)
    }
    scrollToBottom()
}

function scrollToBottom(){
    chatContent.scrollTo(0,chatContent.scrollHeight);
    const imgs = messagesList.querySelectorAll('img')
    if (imgs.length < 1)return
    imgs[imgs.length-1].onload = ()=>{
        setTimeout(()=>{
            chatContent.scrollTo(0,chatContent.scrollHeight);
        },0)
    }
}
function checkURL(url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}
function testImage(url, timeoutT) {
    return new Promise(function (resolve, reject) {
        var timeout = timeoutT || 5000;
        var timer, img = new Image();
        img.onerror = img.onabort = function () {
            clearTimeout(timer);
            reject("error");
        };
        img.onload = function () {
            clearTimeout(timer);
            resolve("success");
        };
        timer = setTimeout(function () {
            // reset .src to invalid URL so it stops previous
            // loading, but doesn't trigger new load
            img.src = "//!!!!/test.jpg";
            reject("timeout");
        }, timeout);
        img.src = url;
    });
}
function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }
async function createMessageHTML(message){
    const messageOwner = message.sender._id === userLoggedIn._id ? "mine" : "others"
    let picture = message.attachment ? `<img src="${message.attachment.fileURL}" />` : ""
    let content = message.content ? `<p>${message.content}</p>` : ""
    if (validURL(message.content)){
        const ok = await testImage(message.content, 1000)
        if(checkURL(message.content) || ok === "success"){
            content = ""
            picture = `<img src="${message.content}" />`
        }
    }
    return `<li class="message">
        <span class="${messageOwner}">
            ${picture}
            ${content}
        </span>
    </li>`
}

messageInput.addEventListener('input', e=>{
    resizeInput(messageInput)
})
messageInput.addEventListener('keydown', e=>{
    resizeInput(messageInput)
    if (e.key === "Enter"){
        e.preventDefault()
        messageSendHandler(messageInput.innerText, null, messageInput)
    }
    resizeInput(messageInput)
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
modalInput.addEventListener('input', e=>{
    resizeInput(modalInput)
})
modalInput.addEventListener('keydown', e=>{
    resizeInput(modalInput)
    if (e.key === "Enter"){
        e.preventDefault()
        messageSendHandler(modalInput.innerText, readers, modalInput)
        closeAttachmentsModal()
    }
})
modalInput.addEventListener('paste', (e)=>{
    e.preventDefault();
    var data = e.clipboardData.getData("text/plain");
    let txt = document.createTextNode(data)
    let selection = document.getSelection()
    if (!selection.rangeCount) return false
    selection.deleteFromDocument()
    selection.getRangeAt(0).insertNode(txt)
    modalInput.focus()
    const val = modalInput.textContent
    modalInput.textContent = ""
    modalInput.textContent = val
    placeCaretAtEnd(modalInput)
    var event = new Event('input', {
        bubbles: true,
        cancelable: true,
    });
    modalInput.dispatchEvent(event)
})
const messageInputWrapper = document.getElementById('dajeee')
const attachmentModalInputWrapper = document.querySelector('.attachmentModalInputWrapper')
function resizeInput(element) {
    element.parentNode.parentNode.style.height = ""
    element.parentNode.parentNode.style.height = element.scrollHeight * 2 + "px"
    if (element.scrollHeight - element.parentNode.clientHeight > 5 || element.parentNode.parentNode.clientHeight +5 < element.parentNode.clientHeight){
        messageInputWrapper.style.height = "85%"
        attachmentModalInputWrapper.style.height = "85%"
    }else{
        messageInputWrapper.style.height = "min-content"
        attachmentModalInputWrapper.style.height = "min-content"
    }
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
sendMessageButton.addEventListener('click', e=>{
    resizeInput(messageInput)
    messageSendHandler(messageInput.innerText, null, messageInput)
})
sendMessageButtonAttachmentModal.addEventListener('click', e=>{
    resizeInput(modalInput)
    messageSendHandler(modalInput.innerText, readers, modalInput)
    closeAttachmentsModal()
})

async function messageSendHandler(content=null, attachments=null, container=messageInput){
    const messageContent = content
    if (messageContent.length > 0 || attachments !== null){
        const body = JSON.stringify({
            content: messageContent || '',
            chatId: GchatId,
            attachments: attachments || null
        })
        const res = await fetch('/messages/api', {
            method: "POST",
            body,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const messages = await res.json()
        if (!messages.error){
            if (Array.isArray(messages)){
                messages.forEach(async message=>{
                    messagesList.innerHTML += await createMessageHTML(message)
                })
            }else{
                messagesList.innerHTML += await createMessageHTML(messages)
            }
            if (container !== null)
                container.innerText = ""
            if (container === modalInput) messageInput.innerText = ""
            await getChatPreviews()
            scrollToBottom()
        }
    }
}
openFilesButton.addEventListener('click', e=>{
    inputFile.click()
})
let filenames = []
let readers = []
let atts = []
inputFile.addEventListener('change', async (e)=>{
    e.preventDefault()
    let files = e.currentTarget.files;
    if(!files.length) return
    attachmentsModal.style.display = "block"
    for(let file of files){
        console.log(file)
        filenames.push(file.name)
        const dataUrl = await readAsDataUrl(file)
        readers.push({
            data: dataUrl,
            name: file.name,
            size: file.size
        })
        const att = document.createElement('div')
        att.className = "attachment"
        att.setAttribute('data-name', file.name)
        att.innerHTML = `
            <button class="removeAttachmentButton"><i class="fas fa-times"></i></button>
            <img src="${dataUrl}" alt="">
            <p class="imageTitle">${file.name}</p>`
        atts.push(att)
        attachmentsList.appendChild(att)
    }
    modalInput.innerText = messageInput.innerText
    removeAttachmentButtonListener()
})
function readAsDataUrl(file){
    return new Promise(function(resolve,reject){
        let fr = new FileReader();

        fr.onload = function(){
            resolve(fr.result);
        };

        fr.onerror = function(){
            reject(fr);
        };

        fr.readAsDataURL(file);
    });
}
attachmentsModal.addEventListener('click', (e)=>{
    if (e.target === attachmentsModal){
        closeAttachmentsModal()
    }
})
attachmentsList.addEventListener("wheel", (evt) => {
    evt.preventDefault();
    attachmentsList.scrollLeft += evt.deltaY;
});
function removeAttachmentButtonListener(){
    attachmentsList.querySelectorAll('.removeAttachmentButton').forEach((btn, index)=>{
        btn.addEventListener('click', e=>{
            const index = filenames.findIndex(filename=>filename===e.target.parentNode.attributes['data-name'].value.toString())
            if (index < 0 || index >= filenames.length) return closeAttachmentsModal()
            filenames.splice(index,1)
            readers.splice(index,1)
            atts[index].remove()
            atts.splice(index,1)
            if (filenames.length < 1) closeAttachmentsModal()
        })
    })
}
function closeAttachmentsModal(){
    attachmentsModal.style.display = "none"
    filenames = []
    readers = []
    atts = []
    attachmentsList.innerHTML = ""
    modalInput.innerText = ""
}