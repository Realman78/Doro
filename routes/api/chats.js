const express = require('express')
const router = express.Router()
const User = require('../../schemas/UserSchema')
const Chat = require('../../schemas/ChatSchema')
const Message = require('../../schemas/MessageSchema')

router.get('/', async (req,res)=>{
    let chats = await Chat.find({users: { $elemMatch: {$eq: req.session.user._id} }})
    .populate("users")
    .populate("latestMessage")
    .sort({updatedAt: -1})
    .catch((e)=>console.log(e))
    
    chats = await User.populate(chats, {path: "latestMessage.sender"})
    res.send(chats)
})

router.post('/create', async (req,res)=>{
    if (!req.body.latestMessage || !req.body.users) return res.send(400)
    const latestMessage = req.body.latestMessage
    const users = req.body.users
    let isGroupChat = users.length > 2
    const body = {
        users,
        isGroupChat
    }
    let chat = await Chat.findOne({users}).catch(e=>{console.log(e)})
    if (chat){
        return res.send({error: 'Chat exists'})
    }else{
        chat = await Chat.create(body).catch(e=>console.log(e))
        let message = await Message.create({
            content: latestMessage,
            chat: chat._id,
            sender: req.session.user._id
        })
        await chat.updateOne({latestMessage: message})
        return res.send(chat)
    }
})
router.get('/:chatId', async (req,res)=>{
    const chats = await Chat.findOne({ _id: req.params.chatId,users: { $elemMatch: {$eq: req.session.user._id} }})
    .populate("users")
    .catch((e)=>console.log(e))
    res.send(chats)
}) 
router.get('/:chatId/messages', async (req,res)=>{
    const chats = await Message.find({chat: req.params.chatId})
    .populate("sender")
    .populate("attachment")
    .catch((e)=>console.log(e))
    res.send(chats)
})
module.exports = router