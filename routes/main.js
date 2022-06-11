const router = require('express').Router()
const PatientData = require('../models/PatientData')
const Medicine = require('../models/Medicine')
const MedPurchased = require('../models/MedPurchased')
const MedRequest = require('../models/MedRequest')
const Store = require('../models/Store')

// Store Patient data in mongodb
router.post('/createUser',async(req,res) => {
    const { UID, name, email, address, phoneNum, sex, city, state, country } = req.body
    const patientData = new PatientData({
        UID, name, email, address, phoneNum, sex, city, state, country
    })

    await patientData.save()

    console.log(UID)
    res.send('done')
})

router.get('/getAllMed',async(req,res) => {
    const medicine = await Medicine.find()
    res.send(medicine)
})

// Get Patient Data
router.post('/getPatientData',async(req,res) => {
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

router.post('/medicine',async(req,res) => {
    const {medName, batch, expDate, quantity, MRP, tax, price} = req.body

    const medicine = new Medicine({
        medName, batch, expDate, quantity, MRP, tax, price
    })

    await medicine.save()

    res.send('done')
})

router.post('/getMed',async(req,res) => {
    const { medID } = req.body

    const medicine = await Medicine.findById(medID)

    if (medicine.length === 0){
        res.send('No such medicine')
    }else{
        res.send(medicine)
    }
})

router.post('/medReq/:id',async(req,res) => {
    const id = req.params.id
    const { medReq } = req.body
    
    const medicine = await Medicine.findById(id)
    medicine.quantity = medicine.quantity - medReq

    if(medicine.quantity > 0){
        await medicine.save()
        res.send(medicine)
    } else {
        res.send('medicine is lesser the req amount')
    }
})

router.post('/checkout', async(req,res) => {
    const { UID, cartItems, service } = req.body

    cartItems.map(async (m, i) => {

        var medQuantity = await Medicine.findById(m._id)
        
        if ((medQuantity.quantity - parseInt(m.qty)) < 0) {
            console.log(`${m.medName} has only ${m.quantity} medicines left but more medicnie are requested`)
            cartItems.splice(i,1)
            res.send(`${m.medName} has only ${m.quantity} medicines left but more medicnie are requested`)
        
        } else {
            try {
                medQuantity.quantity = medQuantity.quantity - parseInt(m.qty)
                if(medQuantity.quantity == 0){
                    await Medicine.findByIdAndDelete(medQuantity._id)
                } else {
                    await medQuantity.save()
                }
            }
            catch(err) {console.log(err)}

            const MedItems = new MedPurchased({
                UID, cartItems, service
            })
        
            await MedItems.save()
        
            res.send('successfully Checked Out')
            }
    })
})

router.post('/return/:id',async(req,res)=>{
    const id = req.params.id

    const medDetails = await MedPurchased.findById(id)
    const PatientDetails = await PatientData.find({'UID':medDetails.UID})

    res.send([medDetails, PatientDetails])
})

router.post('/returnMed',async(req,res) => {
    const { medArray } = req.body

    console.log('medARray', medArray)

    medArray.cartItems.map(async(med, index) => {
        const medicine = await Medicine.findById(med._id)
        
        medicine.quantity = medicine.quantity + parseInt(med.returnQuantity)

        await medicine.save()
    })

    const medArrayInfo = await MedPurchased.findById(medArray._id)

    medArray.cartItems.map(async(med, index) => {
        med.qty = parseInt(med.qty) - parseInt(med.returnQuantity)
        console.log(med.qty)
    })
    

    medArrayInfo.cartItems = medArray.cartItems

    await medArrayInfo.save()

    medArray.cartItems.map(bill => {
            console.log(bill.qty)
    })

    res.send('done')
})

router.post('/medRequest',async(req,res) => {
    const { products } = req.body
    console.log(products)

    products.map(async (item) => {
        console.log(item.checked)

        const present = await MedRequest.findById(item._id)
        console.log('data is present',present)
        if (present == null){
            medName = item.medName
            requiredQty = item.requiredQty
            checked = item.checked
            const data = new MedRequest({
                medName, requiredQty, checked
            })
            await data.save()
        } else {
            present.checked = true
            await present.save()
        }
    })

    res.send('done')
})

router.post('/medRequired',async(req,res) => {
    const data = await MedRequest.find({'checked': 'false'})
    res.send(data)
})

router.get('/store',async(req,res) => {
    const data = await MedRequest.find({
        $and: [
            {'checked': 'true'},
            // {'sent': 'false'}
            {'requiredQty': {$gt : 0}}
        ]
    })

    res.send(data)
})

router.post('/medSent',async(req,res) => {

    const {p, expireDate, MRP, tax, price, batch} = req.body

    console.log(p)

    const medName = p.medName
    const qty = p.qty
    const reqQuantity = p.requiredQty

    const data = new Store({
        medName, qtySent: qty, reqQuantity, expDate:expireDate, MRP, tax, price, batch
    })

    const prod = await MedRequest.findById(p._id)
    prod.requiredQty = prod.requiredQty-p.qty

    await prod.save()

    await data.save()

    res.send('added')
})


router.post("/medReceived",async(req,res) => {

   const data = await Store.find()
   res.send(data)

})

router.post("/billDetails",async(req,res) => {
    const {uid, afterDate, beforeDate} = req.body
    console.log(uid, afterDate, beforeDate)
    console.log(new Date(afterDate), '2022-06-04T13:24:56.678+00:00')
    const data = await MedPurchased.find({
        $and:[
            {'UID':uid},
            {'Date': {$gt : new Date(beforeDate)}},
            {'Date': {$lt : new Date(afterDate)}},
        ]}
    )
    console.log(data)
    res.send(data)
})

router.post("/deletedMedReq",async(req,res) => {
    const {prod} = req.body
    
    await Store.findByIdAndDelete(prod._id)

    var medName = prod.medName
    var batch = prod.batch
    var expDate = prod.expDate
    var quantity = prod.qtySent
    var MRP = prod.MRP
    var tax = prod.tax
    var price = prod.price

    var present = await Medicine.find({
        $and:[
            {'medName' : medName},
            {'batch' : batch}
        ]
    })

    if(present.length > 0){
        var data = await Medicine.find({
            $and:[
                {'medName' : medName},
                {'batch' : batch}
            ]
        })
        
        data[0].quantity = data[0].quantity + quantity
        await data[0].save()
    } else {
        var data2 = new Medicine({
            medName, batch, quantity, MRP, tax, price, expDate
        })
    
        await data2.save()
    }
    
    res.send('ok')
})

module.exports = router