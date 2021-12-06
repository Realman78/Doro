const express = require('express')
const router = express.Router()
const User = require('../../schemas/UserSchema')

router.post('/create', async (req,res)=>{
    if (!req.body.username || !req.body.password || !req.body.email) return res.send(400)
    const username = req.body.username
    const email = req.body.email

    const body = {
        username,
        email,
        password: req.body.password
    }
    const user = await User.findOne({
        $or: [{username}, {email}]
    }).catch(e=>{console.log(e)})

    if (user){
        return res.send({error: "❌Username or email already exists"})
    }else{
        const newUser = await User.create(body)
        req.session.user = newUser
        return res.send(newUser)
    }
})
router.post('/login', async (req,res)=>{
    if (!req.body.uoe || !req.body.password) return res.send(400)
    const uoe = req.body.uoe

    const user = await User.findOne({
        $or: [{username: uoe}, {email: uoe}],
        password: req.body.password
    }).catch(e=>{console.log(e)})

    if (!user){
        return res.send({error: "❌Incorrect credentials"})
    }else{
        req.session.user = user
        return res.send(user)
    }
})

module.exports = router