require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const PatientData = require('./models/PatientData')
const Medicine = require('./models/Medicine')
const MedPurchased = require('./models/MedPurchased')
const MedRequest = require('./models/MedRequest')
const Store = require('./models/Store')
const Razorpay = require('razorpay');
const Order = require('./models/Order')
// const dotenv = require('dotenv');

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cors())

mongoose.connect(process.env.MONGO_URI)
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
    const {medName, batch, expDate, quantity, MRP, tax, price} = req.body

    const medicine = new Medicine({
        medName, batch, expDate, quantity, MRP, tax, price
    })

    await medicine.save()

    res.send('done')
})

app.post('/getMed',async(req,res) => {
    const { medID } = req.body

    console.log(medID)
    const medicine = await Medicine.findById(medID)
    console.log(medicine)
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
    // console.log('CARTITEMSSSS',cartItems)

    cartItems.map(async (m, i) => {
        // console.log('%%%%%%%%%%%%%%%%')
        // console.log(m.medName)

        var medQuantity = await Medicine.findById(m._id)
        console.log('medQUantity',m.quantity, m.qty)
        // console.log('medQuantity',medQuantity)
        // console.log(medQuantity.quantity - parseInt(m.qty))
        // console.log('medQuantity',medQuantity)
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
        
            // console.log('MedItems',MedItems)
        
            await MedItems.save()
        
            // console.log('successfully Checked Out')
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
    // console.log(medDetails)
    // ex id: 6241b3c76caa49ba82356e10
    const PatientDetails = await PatientData.find({'UID':medDetails.UID})
    res.send([medDetails, PatientDetails])
})

app.post('/returnMed',async(req,res) => {
    const { medArray } = req.body
    // console.log('in')

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


    // await medArray.save()

    medArray.cartItems.map(bill => {
            console.log(bill.qty)
    })

    // await medBill.save()

    // console.log('medBill',medBill)

    // console.log('out')

    res.send('done')
})

app.post('/medRequest',async(req,res) => {
    const { products } = req.body
    console.log(products)

    products.map(async (item) => {
        console.log(item.checked)
        // medName = item.medName
        // requiredQty = item.requiredQty
        // checked = item.checked
        // const data = new MedRequest({
        //     medName, requiredQty, checked
        // })

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

app.post('/medRequired',async(req,res) => {
    const data = await MedRequest.find({'checked': 'false'})
    res.send(data)
})

app.get('/store',async(req,res) => {
    const data = await MedRequest.find({
        $and: [
            {'checked': 'true'},
            // {'sent': 'false'}
            {'requiredQty': {$gt : 0}}
        ]
    })

    // data.map(d => {
    //     var medname = d.medname
    //     var reqQuantity = d.reqQuantity
    //     var sent = d.sent
    //     var qtySent = d.qtySent
    //     var batch = d.batch
    //     var MRP = d.MRP
    //     var tax = d.tax
    //     var price = d.price

    //     const product = new Store({
    //         medname, reqQuantity, sent, qtySent, batch, MRP, tax, price
    //     })

    //     await product.save()
    // })

    res.send(data)
})

app.post('/medSent',async(req,res) => {

    const {p, expireDate, MRP, tax, price, batch} = req.body

    console.log(p)

    const medName = p.medName
    const qty = p.qty
    const reqQuantity = p.requiredQty

    const data = new Store({
        medName, qtySent: qty, reqQuantity, expDate:expireDate, MRP, tax, price, batch
    })

    const prod = await MedRequest.findById(p._id)
console.log(prod.requiredQty)
console.log(p.qty)
    prod.requiredQty = prod.requiredQty-p.qty

    console.log(prod.requiredQty)

    await prod.save()

    await data.save()

    res.send('added')


    // const {product} = req.body
    
    // await product.map(async d => {
    //     if(d.sent === true) {
    //         const ID = d._id
    //         const prod = await MedRequest.findById(ID)
    //         if(prod.qtySent > 0){
    //             prod.qtySent = prod.qtySent + parseInt(d.qty)
    //         } else {
    //             prod.qtySent = d.qty
    //         }
    //         prod.sent = 'true'
    //         prod.requiredQty = prod.requiredQty-d.qty
    //         await prod.save()
    //     }
    // })

    // const data2 = await MedRequest.find({'sent': 'false'})
    // res.send(data2)
})


app.post("/medReceived",async(req,res) => {

   const data = await Store.find()
   res.send(data)

    // const data = await MedRequest.find({'sent': 'true'})
    // data.map(d => {
    //     console.log(d)
    // })
    // res.send(data)
})

app.post("/billDetails",async(req,res) => {
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

app.post("/deletedMedReq",async(req,res) => {
    const {prod} = req.body
    
    await Store.findByIdAndDelete(prod._id)

    // console.log(prod)

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

    // console.log('present',present)

    if(present.length > 0){
        var data = await Medicine.find({
            $and:[
                {'medName' : medName},
                {'batch' : batch}
            ]
        })
        // console.log(data[0].quantity)
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



// Payment gateway

app.get('/get-razorpay-key', (req, res) => {
    res.send({ key: process.env.RAZORPAY_KEY_ID });
  });
  
  app.post('/create-order', async (req, res) => {
      console.log('in')
    try {
      const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
      });
      const options = {
        amount: req.body.amount,
        currency: 'INR',
      };
      const order = await instance.orders.create(options);
      if (!order) return res.status(500).send('Some error occured');
      res.send(order);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  app.post('/pay-order', async (req, res) => {
    console.log('in')
    try {
      const { amount, razorpayPaymentId, razorpayOrderId, razorpaySignature } =
        req.body;
      const newOrder = await new Order({
        isPaid: true,
        amount: amount,
        razorpay: {
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
          signature: razorpaySignature,
        },
      });
      await newOrder.save();
      res.send({
        msg: 'Payment was successfull',
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  });
  
  app.get('/list-orders', async (req, res) => {
    const orders = await Order.find();
    res.send(orders);
  });


app.listen(process.env.PORT || 5000,() => console.log('running on port 5000'))