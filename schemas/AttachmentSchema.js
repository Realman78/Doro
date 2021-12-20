const mongoose = require('mongoose')

const Schema = mongoose.Schema

const attachmentSchema = new Schema({
    fileURL: {type:String, trim: true},
    fileName: {type:String, trim: true},
    fileSize: {type: Number}
}, { timestamps: true })

var Attachment = mongoose.model('Attachment', attachmentSchema)
module.exports = Attachment