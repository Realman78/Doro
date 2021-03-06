const express = require('express')
const app = express()
const path = require('path')
const {requestLogin} = require('./middleware')
const PORT = process.env.PORT || 3000
require('./db.js')
const session = require('express-session')
app.use(session({
    secret: 'heok',
    resave: true,
    saveUninitialized: false
  }))

app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'hbs')
app.set("views", "views")
app.use(express.urlencoded({extended:true}))
app.use(express.json({limit: '50mb'}));

const registerRoute = require('./routes/registerRouter')
const loginRouter = require('./routes/loginRouter')
const logoutRouter = require('./routes/logout')

app.use('/register', registerRoute)
app.use('/login', loginRouter)
app.use('/logout', logoutRouter)

const userApiRoute = require('./routes/api/users')
const chatApiRoute = require('./routes/api/chats')
const messageApiRoute = require('./routes/api/messages')

app.use('/users/api', userApiRoute)
app.use('/chats/api', chatApiRoute)
app.use('/messages/api', messageApiRoute)

app.get('/', requestLogin,  (req,res)=>{
    const payload = {
        loggedUser: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }
    res.render('index', payload)
})

app.listen(PORT, ()=>{
    console.log(`Server is up and running on port ${PORT}`)
})