const requestLogin = (req,res,next)=>{
    if (req.session && req.session.user){
        return next();
    }else{
        return res.redirect('/login');
    }
}
const returnToHomeIfLoggedIn = (req,res,next)=>{
    if (req.session && req.session.user){
        return res.redirect('/')
    }else{
        next()
    }
}
module.exports = {requestLogin, returnToHomeIfLoggedIn}