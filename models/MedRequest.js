const mongoose = require('mongoose')

const Schema = mongoose.Schema

const medRequest = new Schema({
    medName:{
        type:String,
        required: true
    },
    requiredQty:{
        type:Number,
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
    qtySent:{
        type:Number,
        required: false,
        default: 0
    },
})

module.exports = mongoose.model('medRequest', medRequest)