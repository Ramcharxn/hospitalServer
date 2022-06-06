const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Store = new Schema({
    medName:{
        type:String,
        required: true
    },
    batch:{
        type:Number,
        default: 1,
        // required:true,
    },
    expDate:{
        type:Date,
        // required: true
    },
    reqQuantity:{
        type: Number,
        // required: true
    },
    qtySent:{
        type: Number,
        // required: true
    },
    MRP:{
        type: Number,
        default: 0
        // required: true
    },
    tax:{
        type: Number,
        default: 0
        // required: true
    },
    price:{
        type: Number,
        default: 0
        // required: true
    },
    // Checked:{
    //     type: String,
    //     // required: true
    // },
    // sent:{
    //     type: String,
    //     // required: true
    // }
})

module.exports = mongoose.model('Store', Store)