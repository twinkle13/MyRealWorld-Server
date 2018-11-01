var router = require('express').Router();

router.use('/', require('./user'));
router.use('/profiles', require('./profiles'));
router.use('/articles', require('./articles'));
router.use('/tags', require('./tags'));

router.use(function(err, req, res, next){

    console.log(err)
    if(err.name === 'SequelizeValidationError' || err.name === 'UniqueConstraintError'){
        console.log('----------status should be 422-----------')
      return res.status(422).json({
        errors: Object.keys(err.errors).reduce(function(errors, key){
          errors[key] = err.errors[key].message;
  
          return errors
        }, {})
      })
    }
 
    return next(err);
  });
  
module.exports = router;