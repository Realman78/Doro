const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: { type: String, required: true, trim: true, unique: true},
    email: { type: String, required: true, trim: true, unique: true},
    password: { type: String, required: true},
    comrades: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comradeRequests: [{ type: Schema.Types.ObjectId, ref: 'ComradeRequest' }],
    profilePic: { type: String, default: `https://avatars.dicebear.com/api/bottts/${generateRandomDicebear(16)}.svg`},
    coverPhoto: { type: String}
}, { timestamps: true })

function generateRandomDicebear(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}
var User = mongoose.model('User', UserSchema)
module.exports = User