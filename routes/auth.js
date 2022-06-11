const router = require('express').Router()
const { User } = require('../models/user')
const Joi  = require('joi')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

router.post('/',async(req,res) => {
    try {
        const {error} = validate(req.body)
        
        if(error) {
            return res.status(400).send({ message: error.details[0].message })
        }

        const user = await User.findOne({ userId: req.body.userId })

        console.log(typeof(user))

        if(!user){
            return res.status(401).send({ message: "Invalid userId or password" })
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password)

        if(!validPassword) {
            return res.status(401).send({ message: "Invalid userId or password" })
        }

        // const token = user.generateAuthToken()
        const token = jwt.sign({ user }, process.env.JWTPRIVATEKEY, {expiresIn: "7d"})
        console.log(token)

        res.status(200).send({ data: token, message: "logged in successfully" })

    } catch (err) {
        res.status(500).send({ message: "Internal server error" })
    }
})

const validate = (data) => {
    const schema = Joi.object({
        userId: Joi.string().required().label("userId"),
        password: Joi.string().required().label("Password")
    })
    return schema.validate(data)
}

module.exports = router