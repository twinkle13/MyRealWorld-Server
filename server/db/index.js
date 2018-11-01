const Sequelize = require('sequelize')
var jwt = require('jsonwebtoken');
var slug = require('slug')
const { parseStringIntoArray} = require('../helper/helper')
const {
  user
} = require('./models/userModel')
const { comment } = require('./models/Comment')
const { article } = require('./models/Article')
const { tag } = require('./models/Tag')

const db = new Sequelize({
  dialect: 'sqlite',
  storage: __dirname + '/store.db'
})

const User = db.define('User', user)
const Comment = db.define('Comment', comment)
const Article = db.define('Article', article , {
  validate: {
    validateSlug() {
        this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36)
      
    }
  }
} )
Article.belongsTo(User )
User.hasMany(Article)

Comment.belongsTo(Article)
Article.hasMany(Comment)

Comment.belongsTo(User)
User.hasMany(Comment)


User.prototype.setJWT = function() {
  console.log('setting JWT')
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    id: this.id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, 'secretKey');
}

User.prototype.toAuthJSON = function () {
  return {
    username: this.username,
    email: this.email,
    token: this.setJWT(),
    bio: this.bio,
    image: this.image
  };
}
User.prototype.toProfileJSONFor = function (user) {
  return {
    username: this.username,
    bio: this.bio,
    image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg'
  };
}

Comment.prototype.toJSONFor = function(user) {
  return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      body: this.body,
      author: user.toProfileJSONFor(user)
    }
}
Article.prototype.toAuthJSON = function(user) {
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: parseStringIntoArray(this.tagList),
    author: user.toProfileJSONFor(user)
    }
}

module.exports = {
  db,
  User,
  Comment,
  Article
}