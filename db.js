const mongoose = require('mongoose')
const dburl = "mongodb+srv://admin:admin@maincluster.gojzk.mongodb.net/DoroDB?retryWrites=true&w=majority"
class Database {
    constructor (){
        this.connect()
    }
    connect(){
        mongoose.connect(dburl, { useNewUrlParser: true, 
            useUnifiedTopology: true})
        .then(()=>{
            console.log('Connection to database successful')
        })
        .catch((err)=>{
            console.log(err)
        })
    }
}

module.exports = new Database()
