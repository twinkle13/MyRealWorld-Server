const express = require('express')
const sequelize = require('sequelize')
const slug = require('slug')
const op = sequelize.Op
const {
    Article,
    Comment,
    User
} = require('../../db/index')
var auth = require('../auth')

const {
    parseArrayIntoString
} = require('../../helper/helper')
const router = express()

router.post('/', auth.required, async (req, res, next) => {
    console.log("---------------------------new article entering---------------------")
    console.log(req.body.title)
    const currentUser = await User.findOne({
        where: {
            id: req.payload.id
        }
    })
    console.log(currentUser.id)
    console.log(parseArrayIntoString(req.body.tagList))

    const article = new Article()
    article.title = req.body.title
    article.description = req.body.description
    article.body = req.body.body
    article.tagList = parseArrayIntoString(req.body.tagList)
    article.UserId = currentUser.id

    article.save().then((result) => {
        console.log(result)
        return res.json({
            article: article.toAuthJSON(currentUser)
        });

    }).catch((err) => {
        console.log(err)

    });
    /*
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
    */
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

router.put('/:slug', auth.required, async (req, res, next) => {
    console.log('-----------------in put ----------------')
    console.log(req.payload.id)
    console.log(req.params.slug)
    let article = await Article.findOne({
        where: {
            slug: req.params.slug
        }
    })
    const currentUser = await User.findOne({
        where: {
            id: req.payload.id
        }
    })
    console.log(currentUser)
    console.log(article)
    console.log(article.UserId)
    if (article.UserId === req.payload.id) {
        if (req.body.title !== undefined) {
            article.title = req.body.title;
            console.log(article.slug)
            article.slug = slug(article.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36)
            console.log(article.slug)
        }

        if (req.body.description !== undefined) {
            article.description = req.body.description;
        }

        if (req.body.body !== undefined) {            
            article.body = req.body.body;
        }

        if (req.body.tagList !== undefined) {
            console.log('---')
            console.log(req.body.tagList)
            article.tagList = parseArrayIntoString(req.body.tagList)
        }

        article.save().then( async function (article) {
            article = await Article.findOne({
                where: {
                    id: article.id
                }
            })
            console.log(article)
            return res.json({
                article: article.toAuthJSON(currentUser)
            });
        }).catch(next);
    } else {
        return res.sendStatus(403);
    }


});


router.get('/', auth.optional, async (req, res, next) => {
    console.log('------------in get articles--------')
    var query = {};
    var limit = 20;
    var offset = 0;
    let whereClause = []
    console.log('limit :' + limit + 'offset :'+ offset)
    for (let key of Object.keys(req.query)) {
        console.log('key :' + key)
        console.log(req.query.author)
      switch(key) {
        case 'limit':
        limit = req.query.limit;
          break;
        case 'offset':
        offset = req.query.offset;
          break;
        case 'tag':
        whereClause.push({
            tagList: {[op.like]: '%~' + req.query.tag + '~%'}
          })
          break;
          case 'author':
          const author= await User.findOne({where: { username : req.query.author }})
          if(author){
          whereClause.push({
              UserId: {[op.eq]: author.id}
          })}
          break;
      }  }
      console.log('limit1 :' + limit + 'offset1 :'+ offset)
      
      const articles = await Article.findAll({
        where: {
            [op.and]: whereClause
        },
         limit: limit,
         order: [['createdAt', 'DESC']],
         offset: offset
      }).catch(next)
      const articleArray = articles.map(async article => {
        const user = await User.findOne({where:{ id: article.UserId}})
        console.log(article)
        console.log(user)
        return article.toAuthJSON(user);
      })
      const results = await Promise.all(articleArray)
      return res.json({
        articles: results,
          articlesCount:articles.length
      })
  
             
    });



// delete article
router.delete('/:slug', auth.required, async (req, res, next) => {
    const currentUser = await User.findOne({
        where: {
            id: req.payload.id
        }
    })
    if(!currentUser){
        return res.sendStatus(401);
    }
    let article = await Article.findOne({
        where: {
            slug: req.params.slug
        }
    })
    if(article.UserId === req.payload.id){
       Article.destroy({
            where: {
              id: article.id
            }
          }).then(function(){
            return res.sendStatus(204)
          }).catch(next);
      } else {
        return res.sendStatus(403);
      }
    
  });

  router.post('/:slug/comments', auth.required, async (req, res, next) => {
    const article = await Article.findOne({
        where: {
            slug: req.params.slug
        }
    })
    const currentUser = await User.findOne({
        where: {
            id: req.payload.id
        }
    })
    if(!currentUser){
        return res.sendStatus(401);
    }
    let comment = await article.createComment({
        body: req.body.comment.body,
        UserId: currentUser.id
    }).catch(next)
    return res.json({
        comment: comment.toJSONFor(currentUser)
    })
  });

  router.get('/:slug/comments', auth.optional, async (req, res, next) => {
    const article = await Article.findOne({
        where: {
            slug: req.params.slug
        }
    }).catch(next)
    if(article) {
    const comments = await article.getComments().catch(next)
    const commentArray = comments.map(async comment => {
        const author = await User.findOne({where:{ id: comment.UserId}})
        console.log(comment)
        console.log(author)
        return comment.toJSONFor(author);
      })
      const results = await Promise.all(commentArray)
      return res.json({
        comments: results
      })
    } else{
        return res.sendStatus(404);
    }
  });

  // delete comment
router.delete('/:slug/comments/:id', auth.required, async (req, res, next) => {
    const currentUser = await User.findOne({
        where: {
            id: req.payload.id
        }
    })
    if(!currentUser){
        return res.sendStatus(401);
    }
    let article = await Article.findOne({
        where: {
            slug: req.params.slug
        }
    })
    let comment = await Comment.findOne({
        where: {
            id: req.params.id
        }
    })
    if(comment.UserId === req.payload.id){
        article.removeComment(comment)
        /*
        Comment.destroy({
            where: {
              id: comment.id
            }
          })*/.then(function(){
              console.log('deleted comment')
            return res.sendStatus(204)
          }).catch(next);
          
      } else {
        return res.sendStatus(403);
      }
    
  });
  
module.exports = router