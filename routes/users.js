const router = require('express').Router()
const { User, validate } = require('../models/user')
const bcrypt = require('bcrypt')


router.post('/',async(req,res) => {
    
    try{
        const { error } = validate(req.body)
        if(error) {
            return res.status(400).send({ message: error.details[0].message })
        }

        const user = await User.findOne({ userId: req.body.userId })

        console.log(user)

        if (user === null) {
            return res.status(400).send({ message : 'role for you is not assigned please contact Admin for further details' })
        }

        console.log(user)

        if(user && user.firstName){
            return res.status(409).send({ message: "user with giving userId already exist" })
        }

       const hashPassword = await bcrypt.hash(req.body.password, 10) 
       const exist = await User.findOne({userId: user.userId})

       exist.firstName = req.body.firstName
       exist.lastName = req.body.lastName
       exist.password = hashPassword
       
       console.log(exist)

       await exist.save()
    //    await new User({ ...req.body, password: hashPassword }).save()

       res.status(201).send({ message: "User created successfully" })

    } catch (err) {
        res.status(500).send({ message: "Internal server error" })
    }
})

module.exports = router