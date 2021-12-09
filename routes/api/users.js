const express = require('express')
const router = express.Router()
const User = require('../../schemas/UserSchema')
const ComradeRequest = require('../../schemas/ComradeRequestSchema')

router.get('/get', async (req,res)=>{
    if (!req.query || !req.query.phrase) return res.sendStatus(400)
    let users = await User.find({username: {$regex: req.query.phrase, $options: "i"}})
    users = users.filter((user)=> user._id.toString() !== req.session.user._id.toString())
    return res.send(users)
})

router.get('/me', async (req,res)=>{
    req.session.user = await (await User.findById(req.session.user._id).populate("comrades")).populate("comradeRequests")
    res.send(req.session.user)
})

router.put('/friends/modify', async (req,res)=>{
    if (!req.body.userId) return res.sendStatus(400)
    console.log(req.body)
    for (let user of req.session.user.comrades){
        if (user._id === req.body.userId){
            req.session.user = await User.findByIdAndUpdate(req.session.user._id,{ $pull : {comrades: req.body.userId}}, {new: true}).populate('comrades')
            await User.findByIdAndUpdate(req.body.userId,{ $pull : {comrades: req.session.user._id}}, {new: true})
            return res.send(req.session.user)
        }
    }
    const exists = req.session.user.comradeRequests.findIndex(cReq=>{
        return cReq.requestor === req.session.user._id || cReq.recipient === req.session.user._id
    })
    if (exists !== -1){
        const deletedRequest = await ComradeRequest.findByIdAndDelete(req.session.user.comradeRequests[exists]._id)
        if (!deletedRequest){
            return res.send({error: "Something went wrong. Please refresh and try again! Maybe the other person retracted the request."})
        }
        await User.updateMany({$or: [{_id: deletedRequest.requestor}, {_id: deletedRequest.recipient}]}, {$pull: {comradeRequests: deletedRequest._id}}, {new: true})
        req.session.user = await (await User.findById(req.session.user._id).populate("comrades")).populate("comradeRequests")
        if (deletedRequest.requestor.toString() !== req.session.user._id && req.body.accepted === "true"){
            console.log('ako ovo vidis reci duju da je idiot')
            req.session.user =await (await User.findByIdAndUpdate(req.session.user._id, {$addToSet: {comrades: req.body.userId}}, {new: true})).populate("comrades")
            await User.findByIdAndUpdate(req.body.userId, {$addToSet: {comrades: req.session.user._id}})
        }
        console.log(req.session.user)
        return res.send(req.session.user)
    }
    console.log('ok')
    const body = {
        requestor: req.session.user._id,
        recipient: req.body.userId
    }
    const comradeRequest = await ComradeRequest.create(body).catch(e=>console.log(e))
    req.session.user = await User.findByIdAndUpdate(req.session.user._id, { $addToSet : {comradeRequests: comradeRequest}}, {new: true}).populate("comradeRequests")
    await User.findByIdAndUpdate(req.body.userId, { $addToSet : {comradeRequests: comradeRequest}})
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
        const newUser = await (await (await User.create(body)).populate("comrades")).populate("comradeRequests")
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
        req.session.user = await (await user.populate("comrades")).populate("comradeRequests")
        return res.send(user)
    }
})

module.exports = router