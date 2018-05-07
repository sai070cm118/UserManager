var _repository=require('../Repository/index');
var _profileService=require('./ProfileService');


var ConfigurationManager = require('../Utilities/Configuration/index');
var NotificationManager = require('../Utilities/Notification/index');

const SecurityManager = require('../Utilities/SecurityManager/index');
var moment = require('moment');



var Service={
    add:function(User,callback){
        _repository.UserRepository.add(User,callback);
    },
    update:function(User,callback){
         _repository.UserRepository.update(User,callback);
    },
    delete:function(id,callback){
        _repository.UserRepository.delete(id,callback);
    },
    getAll:function(callback){
        _repository.UserRepository.getAll(callback);
    },
    getById:function(id,callback){
        _repository.UserRepository.getById(id,callback);
    },
    getByEmail:function(email,callback){
        _repository.UserRepository.getByEmail(email,callback);
    },
    getByEmailOrMobile:function(email,mobile,callback){
        _repository.UserRepository.getByEmailOrMobile(email,mobile,callback);
    },
    authenticateUser:function(UserIdentity,callback){
        _repository.UserRepository.getByName(UserIdentity,callback);
    },
    verifyEmail: function (userId,verificationToken, callback) {
        _repository.UserRepository.getByEmailVerificationToken(verificationToken,function(userData){
            if(userData.error)
                callback({error:true,data:'Unable to verify Email.'});
            else{
                var profile={_id:userData.data.get('_id'),Status:2,EmailVerification:66666666};
                if(profile._id==userId){
                    _repository.UserRepository.update(profile,function(){

                    });
                    _profileService.update(profile,function(updatedProfile){
                        if(updatedProfile.error){
                            callback({error:true,data:'Unable to verify Email.'});
                        }
                        else{
                            callback({error:false,data:'Email verification sucess.'});
                        }
                    });
                }
                else{
                    callback({error:true,data:'Unable to verify Email.'});
                }
            }
        });
    },
    login:function(user,callback){
        this.getByEmailOrMobile(user.Email,user.Email,function(result){

            console.log(result);

            if(result.error)
                callback(result);
            else{
                var hashedPassword=SecurityManager.sha512(user.Password,result.data.get('Salt'));
                
                if(result.data.get('PasswordHash')==hashedPassword.passwordHash){

                    _profileService.getById(result.data.get('_id'),function(result){

                        if(result.data.Status==1)
                            callback({error:false,data:{message:'Email not verified.',code:2,data:result.data}});
                        else if(result.data.Status==2)
                            callback({error:false,data:{message:'Mobile not verified.',code:3,data:result.data}});
                        else if(result.data.Status==3){
                            if(result.data.IsActive){
                                callback({error:false,data:{message:'Login Sucess.',code:4,data:result.data}});
                            }
                            else{
                                callback({error:true,data:{message:'Your account is in active.',code:3}});
                            }
                        }
                        else{
                            callback({error:true,data:{message:'Unable to login right now. Please try later.',code:4}});
                        }
                    });
                }
                else{
                    callback({error:true,data:'Invalid Credentials'});
                }
            }
        });
    },
    setPassword:function(user,callback){

        console.log(user);

        var hashedPassword=SecurityManager.saltHashPassword(user.Password);
        user.PasswordHash=hashedPassword.passwordHash;
        user.Salt=hashedPassword.salt;


        _profileService.getById(user._id,function(result){

            if(result.error)
                callback(result);
            else{
                console.log(result);
                if(result.data.Status<2){
                    _repository.UserRepository.update(user,function(result){
                        if(result.error)
                            callback(result);
                        else{
                            _profileService.update({_id:user._id,Status:2},function(result){
                                callback(result);
                            });
                        }
                    });
                }
                else{
                    callback({error:true,data:'Unable to set password.'});
                }
            }
        });
    },
    resetPassword:function(user,callback){

        var hashedPassword=SecurityManager.saltHashPassword(user.Password);
        user.PasswordHash=hashedPassword.passwordHash;
        user.Salt=hashedPassword.salt;

        _repository.UserRepository.getByEmailOrMobile(user.Email,user.Email,function(result){

            if(result.error)
                callback(result);
            else{
                var oldHashedPassword=SecurityManager.sha512(user.OldPassword,result.data.Salt);

                if(result.data.PasswordHash==oldHashedPassword.passwordHash){
                    _repository.UserRepository.update(user,callback);
                }
                else{
                    callback({error:true,data:{message: 'Invalid Credentials.'}});
                }
            }
        });
    },
    forgotPassword:function(EmailOrMobile,callback){
        _repository.UserRepository.getByEmailOrMobile(EmailOrMobile,EmailOrMobile,function(result){

            if(result.error)
                callback({error:true,data:'User not available with given details.'});
            else{
                var user={
                    _id:result.data.get('_id'),
                    TimeStamp:new Date(new Date(new Date().setMinutes(new Date().getMinutes()+5)).toUTCString()),
                    Email:result.data.get('Email').toLowerCase()
                }
                
                if(result.data.get('Email').toLowerCase()==EmailOrMobile.toLowerCase()){
                    user.RecoverType=false;
                    user.RecoverHash=SecurityManager.generateRandomString(8,/\d/);
                }
                else{
                    user.RecoverType=true;
                    user.RecoverHash=SecurityManager.generateRandomString(6,/\d/);
                }

                _repository.UserRepository.update(user,function(result){
                    if(result.error){
                        callback({error:true,data:'Unable to send the recover your account.'});
                    }
                    else{
                        result.data={"RecoverType":user.RecoverType};

                        if(!user.RecoverType){
                            var mailOptions = {
                                from: 'raviteja.vinnakota6@gmail.com',
                                to: user.Email,
                                subject: 'Recover Email',
                                text: user.RecoverHash
                            };
    
                            NotificationManager.sendEmail(mailOptions);
                        }
                        else{
                            //TODO: Send OTP to mobile.
                        }

                        callback(result)
                    }
                });                    
            }
        });
    },
    verifyMobile:function(user,callback){
        _repository.UserRepository.getById(user._id,function(profile){
            if(profile.error)
                callback(profile);
            else{
                if(profile.data.MobileVerification==user.MobileVerification){
                    profile={_id:user._id,Status:3,IsActive:true,MobileVerification:666666};
                    _repository.UserRepository.update(profile,function(){

                    });
                    _profileService.update(profile,function(result4){
                        callback({error:false,data:'Your mobile verification sucess.'});
                    });
                }
                else{
                    callback({error:true,data:'Unable to verify the mobile.'});
                }
            }
        });
    },
    RecoverPassword:function(user,callback){
        _repository.UserRepository.getByEmailOrMobile(user.Email,user.Email,function(result){
            if(result.error)
                callback(result);
            else{

                if(result.data.get('RecoverHash')!=user.RecoverHash){
                    callback({error:true,data:'Invalid Recover Token/OTP.'});
                }
                else{
                    if(result.data.get('TimeStamp')>new Date(new Date().toUTCString())){
                        var hashedPassword=SecurityManager.saltHashPassword(user.Password);
                        user.PasswordHash=hashedPassword.passwordHash;
                        user.Salt=hashedPassword.salt;
                        user.RecoverHash='66666666';
                        user.TimeStamp=null;
                        user.RecoverType=null;
                        user._id=result.data.get('_id');

                        _repository.UserRepository.update(user,function(result){
                            callback({error:true,data:'Recovery password suces.'});
                        });
                    }
                    else{
                        callback({error:true,data:'Recover Token/OTP expired.'});
                    }
                }
            }
        });
    },
    ForgotEmailTemplate:function(recoveryLink){
        return '<div class="maincontainer" style="box-sizing: border-box;background:#cccacab0;  width:100%;  height:auto;  padding:10px;">	<div class="Detailscontainer" style="margin-top:20px;  width:90%;  background:white;  margin:auto;  box-shadow: 7px 7px 5px -5px gray;  padding:0px 20px 0px 20px;"> 		<div class="Details" style="box-sizing: border-box;padding:5px 50px 0px 20px;  height:60px;  width:100%;">			<p style=\'font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;"\'>To reset your password for GT, please follow the <a href="'+recoveryLink+'">link</a> below: <p>'+recoveryLink+' </p></p>		</div> 	</div></div>'
    }


};
module.exports=Service;


