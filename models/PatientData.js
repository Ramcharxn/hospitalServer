const mongoose = require('mongoose')

const Schema = mongoose.Schema

const PatientData = new Schema({
    UID:{
        type: String,
        required: true,
        unique: true
    },
    name:{
        type: String,
        // required: true
    },
    email:{
        type: String,
        // required: true
    },
    phoneNum:{
        type: String,
        // required: true
    },
    address:{
        type: String,
        // required: true
    },
    city:{
        type: String
    },
    state:{
        type: String
    },
    country:{
        type: String
    },
    sex:{
        type: String
    }
})

module.exports = mongoose.model('PatientData', PatientData)