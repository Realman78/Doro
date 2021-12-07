const express = require('express')
const router = express.Router()
const User = require('../../schemas/UserSchema')

router.get('/get', async (req,res)=>{
    if (!req.query || !req.query.phrase) return res.sendStatus(400)
    let users = await User.find({username: {$regex: req.query.phrase, $options: "i"}})
    users = users.filter((user)=> user._id.toString() !== req.session.user._id.toString())
    return res.send(users)
})


router.put('/friends/modify', async (req,res)=>{
    if (!req.body.userId) return res.sendStatus(400)
    var isFollowing = false
    for (let user of req.session.user.comrades){
        if (user._id === req.body.userId){
            isFollowing = true;
            break;
        }
    }
    let option = isFollowing ? "$pull" : "$addToSet"
    req.session.user = await User.findByIdAndUpdate(req.session.user._id,{ [option]: {comrades: req.body.userId}}, {new: true}).populate('comrades')
    res.send(req.session.user)
})

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
        req.session.user = await user.populate("comrades")
        return res.send(user)
    }
})

module.exports = router