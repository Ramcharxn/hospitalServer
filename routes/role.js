const router = require('express').Router()
const { User } = require('../models/user')

router.post('/',async(req,res) => {
    console.log(req.body)

    const exist = await User.findOne({userId: req.body.userId})

    // console.log('exist',(exist.userId !== undefined))

    if(exist) {
        return res.send('role for this UserId alreacy allocated')
    } else {
            
        const user = new User(req.body)
        console.log(user)
        await user.save()

        res.send('role assigned successfully')
    }

})

router.post('/unrole',async(req,res) => {
    try{
    const deleted = await User.findOneAndDelete({userId: req.body.userId})
    console.log(deleted)
    if(deleted == null){
        res.send('userId doesnt exist')
    } else {
        res.send('user deleted')
    }
    } catch (err) {
        res.send(err.message)
    }
})

module.exports = router