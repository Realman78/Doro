const express = require('express')
const router = express.Router()
const {returnToHomeIfLoggedIn} = require('../middleware')

router.get('/', returnToHomeIfLoggedIn, (req,res)=>{
    res.render('login')
})

module.exports = router