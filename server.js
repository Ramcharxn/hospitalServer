require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const paymentRoute = require('./routes/payment')
const mainRoute = require('./routes/main')
const userRoutes = require('./routes/users')
const authRoutes = require('./routes/auth')
const roleRoutes = require('./routes/role')

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



app.use('/',paymentRoute)
app.use('/',mainRoute)
app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/role", roleRoutes)



app.listen(process.env.PORT || 5000,() => console.log('running on port 5000'))