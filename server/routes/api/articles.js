const express = require('express')
const {
    Article,
    User
} = require('../../db/index')
const { parseArrayIntoString } = require('../../helper/helper')
const router = express()

router.post('/', function(req, res, next) {
    console.log("---------------------------new article entering---------------------")
    console.log(parseArrayIntoString(req.body.tagList))
    var article = Article.build({
        title: req.body.title,
        description: req.body.description,
        body: req.body.body,
        tagList: parseArrayIntoString(req.body.tagList),
        UserId: 1
    })
    article.save().then((result) => {
        console.log(result)
        const user = User.findOne({where: { id : 1 }})
        console.log(user)
        console.log(user.UserId + user.username)
        return res.json({article: article.toAuthJSON(user)});
        
    }).catch((err) => {
        console.log(err)
        
    });
  });

module.exports = router

