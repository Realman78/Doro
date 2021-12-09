const mongoose = require('mongoose')

const Schema = mongoose.Schema

const comradeRequestSchema = new Schema({
    confirmed: {type: Boolean, default: false},
    requestor: { type: Schema.Types.ObjectId, ref: 'User' },
    recipient: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

var ComradeRequest = mongoose.model('ComradeRequest', comradeRequestSchema)
module.exports = ComradeRequest