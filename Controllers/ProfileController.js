
var express=require('express');
var Router=express.Router();
var _service=require('../Service/index');
const SecurityManager = require('../Utilities/SecurityManager/index');


Router.route('/')
    .get(SecurityManager.extractUserFromToken,function (req, res,next) {

        _service.ProfileService.getById(req.body.UserId,function(result){
            req.result=result;
            next();
        });

    })
    .post(function (req, res,next) {

        _service.MongoUserService.add(req.body,function(result){
            req.body._Id=result.data._id;
            _service.ProfileService.Create(req.body,function(result){
                res.send(result);
            });
        });

        
    })
    .put(function (req, res,next) {
        _service.ProfileService.update(req.body,function(result){
            req.result=result;
            next();
        });
    })
    .delete(function (req, res,next) {
        _service.ProfileService.delete(req.body,function(result){
            req.result=result;
            next();
        });
    });


Router.route('/:id')
  .get(function (req, res,next) {
    _service.ProfileService.getById(req.params.id,function(result){
        req.result=result;
        next();
    });
});

  
Router.route('/ByName/:Name')
  .get(function (req, res,next) {
    _service.ProfileService.getByName(req.params.Name,function(result){
        req.result=result;
        next();
    });
});

Router.route('/ByEmail/:Email')
.get(function (req, res,next) {
  _service.ProfileService.getByEmail(req.params.Email,function(result){
      req.result=result;
      next();
  });
});


Router.route(['/SearchProfile/ByName','/SearchProfile/ByName/:Name'])
  .get(function (req, res,next) {
    console.log('coming');
    _service.ProfileService.searchProfile(req.params.Name,function(result){
        req.result=result;
        next();
    });
});

Router.route('/validateToken/:token')
.get(function (req, res) {


  SecurityManager.verifyToken(req.params.token,function(err,user){
      if(user==undefined || user.error)
        res.json({error:true,data:''});
      else{
        _service.ProfileService.getById(user.body.Id,function(result){
            res.json(result);

        });
      }
  });

});

module.exports=Router;