const express = require('express')
const router = express.Router()
const User = require('../../schemas/UserSchema')
const Chat = require('../../schemas/ChatSchema')
const Message = require('../../schemas/MessageSchema')


router.post('/', async (req,res)=>{
    if (!req.body.content || !req.body.chatId){
        console.log("Invalid data passed into request")
        return res.sendStatus(400)
    }

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

        res.status(201).send(result)
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