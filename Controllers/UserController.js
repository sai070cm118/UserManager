var express=require('express');
var Router=express.Router();
var _service=require('../Service/index');
var requestIp = require('request-ip');

const SecurityManager = require('../Utilities/SecurityManager/index');
const ConfigurationManager = require('../Utilities/Configuration/index');
const NotificationManager = require('../Utilities/Notification/index');

Router.route('/')
  .get(function (req, res) {
       _service.UserService.getAll(function(result){
            if(result.error)
                res.status(500).json(result);
            else
                res.json(result);
       });
  })
  .post(function (req, res) {
      req.body.RegistrationIp=requestIp.getClientIp(req);
    _service.UserService.add(req.body,function(result){
        if(result.error)
            res.status(500).json(result);
        else
            res.json(result);
    });
  })
  .put(function (req, res) {
    _service.UserService.update(req.body,function(result){
        if(result.error)
            res.status(500).json(result);
        else
            res.json(result);
    });
  })
  .delete(function (req, res) {
    var result= _service.UserService.delete(req.body.id,function(result){
            if(result.error)
                res.status(500).json(result);
            else
                res.json(result);
       });
  });

  Router.route('/AddGoogleId')
  .put(function (req, res) {
    var result= _service.UserService.update(req.body,function(result){
            if(result.error)
                res.status(500).json(result);
            else
                res.json(result);
       });
  });
  
  Router.route('/AddFacebookId')
  .put(function (req, res) {
    var result= _service.UserService.update(req.body,function(result){
            if(result.error)
                res.status(500).json(result);
            else
                res.json(result);
       });
  });
  

  Router.route('/:id')
  .get(function (req, res) {
    _service.UserService.getById(req.params.id,function(result){
        if(result.error)
            res.status(500).json(result);
        else
            res.json(result);
    });
    
  });

Router.route('/GetByEmail/:Email')
  .get(function (req, res) {
    _service.UserService.getByEmail(req.params.Email,function(result){
            if(result.error)
                res.status(500).json(result);
            else
                res.json(result);
       });
  });
  
Router.route('/GetByEmailOrMobile/:EmailOrMobile')
  .get(function (req, res) {

        _service.UserService.getByEmailOrMobile(req.params.EmailOrMobile,function(result){
            if(result.error)
                res.status(500).json(result);
            else
                res.json(result);
        });
  });


//START : Verification Process


Router.route('/resend/VerificationEmail')
  .get(SecurityManager.extractUserFromToken,function (req, res) {

        _service.ProfileService.getById(req.body.UserId,function(result){
            if(result.error)
                res.json(result);
            else{

                var resendData={_id:req.body.UserId,EmailVerification:SecurityManager.generateRandomString(8,/\d/)};

                _service.UserService.update(resendData,function(result){
                    if(!result.error){
                        var mailOptions = {
                            from: 'raviteja.vinnakota6@gmail.com',
                            to: result.data.Email,
                            subject: 'Verification Email',
                            text: resendData.EmailVerification
                        };
    
                        NotificationManager.sendEmail(mailOptions);
                        
                        res.send({error:false,data:'New Verification token send to your Email.'});
                    }
                    else{
                        res.send({error:false,data:'Unable to send Verification token.'});
                    }
                });
            }
        });
  });

Router.route('/VerifyEmail/:Token')
  .get(SecurityManager.extractUserFromToken,function (req, res) {
    _service.UserService.verifyEmail(req.body.UserId,req.params.Token,function(result){
        res.send(result);
    });
  });

Router.route('/AddMobileNo')
  .post(SecurityManager.extractUserFromToken,function (req, res) {
    _service.ProfileService.getById(req.body.UserId,function(result){
        if(result.error){
            res.json(result);
        }
        else{
            if(result.data.Status==3)
            {
                _service.UserService.update({_id:result.data._id,TempMobile:req.body.User.Mobile,MobileVerificationOTP:SecurityManager.generateRandomString(6,/\d/)},function(result1){
                    if(result1.error)
                        res.json(result1);
                    else
                        res.json(result.data);
                });
            }
            else{
                res.json({error:true,data:'Mobile already Updated.'});
            }
        }
    });
  });

  Router.route('/resend/VerificationOtp')
  .get(SecurityManager.extractUserFromToken,function (req, res) {

        _service.ProfileService.getById(req.body.UserId,function(result){
            if(result.error)
                res.json(result);
            else{

                var resendData={_id:req.body.UserId,MobileVerification:SecurityManager.generateRandomString(6,/\d/)};

                _service.UserService.update(resendData,function(result){
                    if(!result.error){
                        
                        //TODO: Need to send the OTP.

                        res.send({error:false,data:'New Verification OTP send to your Mobile.'});
                    }
                    else{
                        res.send({error:false,data:'Unable to send Verification OTP.'});
                    }
                });
            }
        });
  });

Router.route('/verifyMobile/:Token')
.get(SecurityManager.extractUserFromToken,function (req, res) {
    _service.UserService.verifyMobile({_id:req.body.UserId,MobileVerification:req.params.Token},function(result){
        res.send(result);
    });
});

//END : Verification Process

//START : Handle the Login and Tokens

Router.route('/Login')
.post(function (req, res) {
    _service.UserService.login(req.body.User,function(result){
        if(result.error)
            res.send(result);
        else{

            var claims={Id:result.data._id}
            var token={
                UserId:result.data._id,
                RefreshToken: SecurityManager.createToken(claims,true),
                SessionToken: SecurityManager.createToken(claims,false),
                UserAgent: '',
                DeviceId: '',
                IsMobile:  '',
                Details: '',

            };

            _service.TokenService.create(token,function(tokenResult){
                result.data.Token=token;
                res.send(result);
            });

        }
    });
});

Router.route('/token/refresh')
.get(function (req, res) {
    _service.TokenService.GetByRefreshToken(req.headers['refreshtoken'],function(result){
        if(result.error){
            res.send(result.data);
        }
        else{
            var claims={Id:result.data._id}
            result.data.SessionToken= SecurityManager.createToken(claims,false);
            _service.TokenService.Refresh(result.data,function(){
                res.send(result.data);
            });
        }
    });
});

Router.route('/token/logout')
.get(function (req, res) {
    _service.TokenService.Delete(req.headers['refreshtoken'],function(result){
        res.json(result);
    })
});

//END : Handle the Login and Tokens


//START : Handle the Password Manager

Router.route('/SetPassword')
.post(SecurityManager.extractUserFromToken,function (req, res) {
    if(req.body.Password==undefined || req.body.Password == null || req.body.Password ==""){
        res.status(500).json({error:true,data:'Unable to set Password.'});
    }
    else{
        var user={_id: req.body.UserId,Password:req.body.Password};

        console.log(user);

        _service.UserService.setPassword(user,function(result){
            if(result.error)
                res.status(500).json(result);
            else{
                res.send(result.data);
            }
        });
    }
});

Router.route('/ResetPassword')
.post(SecurityManager.extractUserFromToken,function (req, res) {
    
    if(req.body.Password==undefined){
        res.json({error:true,data:'Password should be 6 to 30 alphanumerics.'}); 
    }
    else if(!(/^[a-zA-Z0-9]{6,30}$/).test(req.body.Password)){
        res.json({error:true,data:'Password should be 6 to 30 alphanumerics.'});        
    }
    else{

        var user={_id:req.body.UserId,Password:req.body.Password,OldPassword:req.body.OldPassword}
        _service.UserService.resetPassword(user,function(result){
            res.json(result);
        });
    }
});

Router.route('/ForgotPassword/:EmailOrMobile')
.get(function (req, res) {
    _service.UserService.forgotPassword(req.params.EmailOrMobile,function(result){
        res.json(result);
    });
});

Router.route('/RecoverPassword')
.post(function (req, res) {

    console.log(req.body.Password);

    if(req.body.Password==undefined){
        res.json({error:true,data:'Password should be 6 to 30 alphanumerics.'}); 
    }
    else if(!(/^[a-zA-Z0-9]{6,30}$/).test(req.body.Password)){
        res.json({error:true,data:'Password should be 6 to 30 alphanumerics.'});        
    }
    else{

        _service.UserService.RecoverPassword(req.body,function(result){
            res.json(result);
        });
    }
});
  
//END : Handle the Password Manager

  
  

module.exports=Router;