
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

        console.log(req.body.User.Email);

        var emailOrMobile=req.body.User.Email || req.body.User.Mobile

        _service.UserService.getByEmailOrMobile(emailOrMobile,function(result){

            if(result.error){
                if(result.data=='Invalid Email or Mobile');
                    _service.ProfileService.Register(req.body,function(result){
                        res.send(result);
                    });
            }
            else{
                res.send({error: true, data: 'User already existed with given Email or Mobile'});
            }
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
    console.log(req.params.id);
    _service.ProfileService.getById(req.params.id,function(result){
        res.send(result);
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
Router.route('/Bytoken/Myprofile')
    .get(function (req, res) {
        _service.TokenService.GetBySessionToken(req.headers['sessiontoken'],function(result){


            console.log(result);

            if(!result.error){
                _service.ProfileService.getById(result.data.userId,function(result){
                    res.json(result);
                });
            }
            else{
                res.json(result);
            }

        });
    });



module.exports=Router;