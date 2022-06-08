const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Purchased = new Schema({
    UID:{
        type: String,
        required: true
    },
    cartItems:{
        type: Object,
        required: true
    },
    // service:{
    //     type: Number,
    //     required: true
    // },
    Date:{
        type: Date,
        required: true,
        default: Date.now()
    }
})

module.exports = mongoose.model('MedPurchased', Purchased)