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
app.use(express.json())

const registerRoute = require('./routes/registerRouter')
const loginRouter = require('./routes/loginRouter')

app.use('/register', registerRoute)
app.use('/login', loginRouter)

const userApiRoute = require('./routes/api/users')

app.use('/users/api', userApiRoute)

app.get('/', requestLogin,  (req,res)=>{
    res.render('index', req.session.user)
})

app.listen(PORT, ()=>{
    console.log(`Server is up and running on port ${PORT}`)
})