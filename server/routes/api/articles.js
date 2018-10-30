const express = require('express')
const sequelize = require('sequelize')
const {
    Article,
    User
} = require('../../db/index')
const { parseArrayIntoString } = require('../../helper/helper')
const router = express()

router.post('/', async(req, res, next)=> {
    console.log("---------------------------new article entering---------------------")
    console.log(req.body.title)
    console.log(parseArrayIntoString(req.body.tagList))
    const article = await Article.create({
        title: req.body.title,
        description: req.body.description,
        body: req.body.body,
        tagList: parseArrayIntoString(req.body.tagList),
        UserId: 1
    })
    const user = User.findOne({where: { id : 1 }})
    console.log(user)
    console.log(user.UserId + user.username)
        return res.json({article: 'sent'});
    /*
    var article = await Article.build({
        title: req.body.title,
        description: req.body.description,
        body: req.body.body,
        tagList: parseArrayIntoString(req.body.tagList),
        UserId: 1
    })
    article.save().then((result) => {
        // console.log(result)
        // const user = User.findOne({where: { id : 1 }})
        // console.log(user)
        // console.log(user.UserId + user.username)
        return res.json({article: 'sent'});
        
    }).catch((err) => {
        console.log(err)
        
    });
    */
  });

module.exports = router

