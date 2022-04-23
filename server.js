const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const PatientData = require('./models/PatientData')
const Medicine = require('./models/Medicine')
const MedPurchased = require('./models/MedPurchased')
const MedRequest = require('./models/MedRequest')

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cors())

mongoose.connect('')
.then(() => console.log('db connected'))
.catch(err => console.log(err.message))

// basic route
app.get('/',(req,res) => {
    res.send('hello')
})

// Store Patient data in mongodb
app.post('/createUser',async(req,res) => {
    const { UID, name, email, address, phoneNum, sex, city, state, country } = req.body
    const patientData = new PatientData({
        UID, name, email, address, phoneNum, sex, city, state, country
    })

    await patientData.save()

    console.log(UID)
    res.send('done')
})

app.get('/getAllMed',async(req,res) => {
    const medicine = await Medicine.find()
    res.send(medicine)
})

// Get Patient Data
app.post('/getPatientData',async(req,res) => {
    const { UID, phoneNum } = req.body
    console.log('uid',UID,'phoneNUm', phoneNum)

    if(UID != ""){
        const patientData = await PatientData.find({'UID': UID})
        console.log(patientData)
        res.send(patientData)
    } else if(phoneNum != ""){
        const patientData = await PatientData.find({'phoneNum': phoneNum})
        res.send(patientData)
    } else{
        console.log('Please enter phone number or uid')
    }
})

app.post('/medicine',async(req,res) => {
    const {medName, expDate, quantity, MRP, tax, price} = req.body

    const medicine = new Medicine({
        medName, expDate, quantity, MRP, tax, price
    })

    await medicine.save()

    res.send('done')
})

app.post('/getMed',async(req,res) => {
    const { medName } = req.body

    const medicine = await Medicine.find({'medName': medName})
    if (medicine.length === 0){
        // console.log('no such med')
        res.send('No such medicine')
    }else{
        res.send(medicine)
    }
})

app.post('/medReq/:id',async(req,res) => {
    const id = req.params.id
    const { medReq } = req.body

    // console.log(id, medReq)
    
    const medicine = await Medicine.findById(id)
    medicine.quantity = medicine.quantity - medReq

    if(medicine.quantity > 0){
        await medicine.save()
        res.send(medicine)
    } else {
        res.send('medicine is lesser the req amount')
    }

    // console.log(medicine)
})

app.post('/checkout', async(req,res) => {
    const { UID, cartItems, service } = req.body
    // console.log('UIDDDDD',UID)
    console.log('CARTITEMSSSS',cartItems)

    cartItems.map(async m => {
        console.log('%%%%%%%%%%%%%%%%')
        console.log(m.medName)

        var medQuantity = await Medicine.find({'medName': m.medName})
        // console.log('medQuantity',medQuantity)
        console.log(medQuantity[0].quantity - parseInt(m.qty))
        // console.log('medQuantity',medQuantity)
        if ((medQuantity[0].quantity - parseInt(m.qty)) < 0) {
            console.log(`${m.medName} has only ${m.quantity} medicines left but more medicnie are requested`)
            res.send(`${m.medName} has only ${m.quantity} medicines left but more medicnie are requested`)
        
        } else {
            try {
                medQuantity[0].quantity = medQuantity[0].quantity - parseInt(m.qty)
                await medQuantity[0].save()
            }
            catch(err) {console.log(err)}

            const MedItems = new MedPurchased({
                UID, cartItems, service
            })
        
            // console.log('MedItems',MedItems)
        
            await MedItems.save()
        
            console.log('successfully Checked Out')
            res.send('successfully Checked Out')
            }
    })

    // for(i in cartItems){
    //     console.log('##################')
    //     console.log(i)
    // }

    
})

app.post('/return/:id',async(req,res)=>{
    const id = req.params.id
    const medDetails = await MedPurchased.findById(id)
    // ex id: 6241b3c76caa49ba82356e10
    const PatientDetails = await PatientData.find({'UID':medDetails.UID})
    res.send([medDetails, PatientDetails])
})

app.post('/returnMed',(req,res) => {
    const { medArray } = req.body
    console.log('in')

    // console.log(medArray.cartItems)

    medArray.cartItems.map(async(med, index) => {
        const medicine = await Medicine.findById(med._id)
        console.log('med completed',index)
        medicine.quantity = medicine.quantity + parseInt(med.returnQuantity)
        await medicine.save()
    })


    console.log('out')

    res.send('done')
})

app.post('/medRequest',async(req,res) => {
    const { products } = req.body
    console.log(products)

    products.map(async (item) => {
        console.log(item.checked)
        medName = item.medName
        requiredQty = item.requiredQty
        checked = item.checked
        const data = new MedRequest({
            medName, requiredQty, checked
        })

        await data.save()
    })

    res.send('done')
})

app.get('/medRequired',async(req,res) => {
    const data = await MedRequest.find({'checked': 'false'})
    res.send(data)
})




app.listen(process.env.PORT || 5000,() => console.log('running on port 5000'))