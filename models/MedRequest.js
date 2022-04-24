const mongoose = require('mongoose')

const Schema = mongoose.Schema

const medRequest = new Schema({
    medName:{
        type:String,
        required: true
    },
    requiredQty:{
        type:String,
        required: true
    },
    checked:{
        type:String,
        required: true
    },
    sent:{
        type:String,
        required: true,
        default: false
    },
})

module.exports = mongoose.model('medRequest', medRequest)