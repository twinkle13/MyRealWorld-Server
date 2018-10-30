const express = require('express')
const sequelize = require('sequelize')
const jwt = require('jsonwebtoken')
var op = sequelize.Op

const {
    User
} = require('../../db/index')

const router = express()


router.get('/user', (req, res) => {
    console.log(req.body)
    res.send('From API route')
})


router.post('/users', async (req, res,next) => {
    console.log("new user entering")
    var user = User.build({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })
    user.save().then((result) => {
        return res.json({user: user.toAuthJSON()});
        
    }).catch((err) => {
        console.log(err)
        
    });
})

router.post('/users/login', async (req, res) => {
    if(!req.body.email){
        return res.status(422).json({
            errors: {
                email: "can't be blank"
            }
        })
    }
    if(!req.body.password){
        return res.status(422).json({
            errors: {
                password: "can't be blank"
            }
        })
    }
    console.log("login user entering")
    const userData = req.body
    let whereClause =[]
    whereClause.push({
        email: userData.email
    })
    whereClause.push({
        password: userData.password
    })
    console.log(whereClause)
    const user = await User.findOne({
       where: {
           [op.and]: whereClause
        }
    })
    if (!user) {
        return res.status(422).json({
            errors: {
                'email or password': 'is invalid'
            }
        })
    } else {
        return res.status(200).json({
            user: user.toAuthJSON()
        });
    }
       
})


module.exports = router