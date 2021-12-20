const express = require('express')
const router = express.Router()
const User = require('../../schemas/UserSchema')
const Chat = require('../../schemas/ChatSchema')
const Message = require('../../schemas/MessageSchema')
const Attachment = require('../../schemas/AttachmentSchema')
var cloudinary = require('cloudinary').v2
cloudinary.config({ 
    cloud_name: 'dzaznxjqv', 
    api_key: '362385972165111', 
    api_secret: 'DhcWGIu_07MYh55dbSaswqQHRi8'
});


router.post('/', async (req,res)=>{
    if (!req.body.chatId){
        console.log("Invalid data passed into request")
        return res.sendStatus(400)
    }
    const messages = []
    const files = req.body.attachments
    if (files && files.length > 0){
        for (let file of files){
            let uploaded = await cloudinary.uploader.upload(file.data, {resource_type: "auto"}, function(err,result){
                if (err) {
                    console.log(err, result) 
                }
                })
            const body = {
                fileURL: uploaded.url,
                fileName: file.name,
                fileSize: file.size
            }
            const attachment = await Attachment.create(body).catch(e=>console.log(e))
            var newMessage = {
                sender: req.session.user._id,
                chat: req.body.chatId,
                attachment: attachment._id
            }
            let result = await Message.create(newMessage).catch((e)=>{
                console.log(e)
                res.status(500).send({error: "Something went wrong"})
            })
            result = await result.populate("sender")
            result = await result.populate("chat")
            result = await result.populate("attachment")
            result = await User.populate(result, {path: "chat.users"})
            const chat = await Chat.findByIdAndUpdate(req.body.chatId, {latestMessage: result}).catch((e)=>console.log(e))
            //insertNotifications(chat, result)
    
            messages.push(result)
        }
    }
    if (!req.body.content) return res.status(201).send(messages)
    
    var newMessage = {
        sender: req.session.user._id,
        content: req.body.content,
        chat: req.body.chatId
    }
    Message.create(newMessage).then(async (result)=>{
        result = await result.populate("sender")
        result = await result.populate("chat")
        result = await User.populate(result, {path: "chat.users"})
        const chat = await Chat.findByIdAndUpdate(req.body.chatId, {latestMessage: result}).catch((e)=>console.log(e))
        //insertNotifications(chat, result)
        messages.push(result)

        res.status(201).send(messages)
    }).catch((e)=>{
        console.log(e)
        res.status(500).send({error: "Something went wrong"})
    })
})
// function insertNotifications(chat, message){
//     chat.users.forEach(userId =>{
//         if (userId == message.sender._id.toString()) return;
//         Notification.insertNotification(userId, message.sender._id, "newMessage", message.chat._id)
//     })
// }
module.exports = router