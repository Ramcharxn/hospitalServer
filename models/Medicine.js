const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Medicine = new Schema({
    medName:{
        type:String,
        required: true
    },
    expDate:{
        type:Date,
        // required: true
    },
    quantity:{
        type: Number,
        // required: true
    },
    MRP:{
        type: Number,
        // required: true
    },
    tax:{
        type: Number,
        // required: true
    },
    price:{
        type: Number,
        // required: true
    },
})

module.exports = mongoose.model('Medicine', Medicine)