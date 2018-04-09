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
    getByEmailOrMobile:function(emailOrMobile,callback){
        _repository.UserRepository.getByEmailOrMobile(emailOrMobile,callback);
    },
    authenticateUser:function(UserIdentity,callback){
        _repository.UserRepository.getByName(UserIdentity,callback);
    },
    getByEmailVerificationToken: function (verificationToken, callback) {
        _repository.UserRepository.getByEmailVerificationToken(verificationToken,function(userData){
            if(userData.error)
                callback(result);
            else{
                var profile={_id:userData.data.get('_id'),Status:3};
                _profileService.getById(profile._id,function(profileData){
                    if(profileData.error)
                        callback(profileData);
                    else{
                        if(profileData.data.Status==2){
                            _profileService.update(profile,function(updatedProfile){
                                if(updatedProfile.error){
                                    callback(updatedProfile);
                                }
                                else{
                                    callback(updatedProfile);
                                }
                            });
                        }
                    }
                });
            }
        });
    },
    login:function(user,callback){
        this.getByEmailOrMobile(user.Email,function(result){
            if(result.error)
                callback(result);
            else{
                var hashedPassword=SecurityManager.sha512(user.Password,result.data.get('Salt'));
                if(result.data.get('PasswordHash')==hashedPassword.passwordHash){
                    _profileService.getById(result.data.get('_id'),function(result){
                        callback(result);
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

        console.log(user);
        _repository.UserRepository.getById(user._id,function(result){

            if(result.error)
                callback(result);
            else{
                var oldHashedPassword=SecurityManager.sha512(user.OldPassword,result.data.Salt);

                if(result.data.PasswordHash==oldHashedPassword.passwordHash){
                    _repository.UserRepository.update(user,function(result){
                        if(result.error)
                            callback(result);
                        else{
                            _profileService.update({_id:user._id},function(result){
                                callback(result);
                            });
                        }
                    });
                }
                else{
                    callback({error:true,data:'Unable to Reset password.'});
                }
            }
        });
    },
    forgotPassword:function(EmailOrMobile,callback){
        _this=this;
        _repository.UserRepository.getByEmailOrMobile(EmailOrMobile,function(result){

            if(result.error)
                callback(result);
            else{
                var user={_id:result.data.get('_id'),RecoverTimeStamp:new Date(new Date(new Date().setMinutes(new Date().getMinutes()+5)).toUTCString()),Email:result.data.get('Email').toLowerCase()}
                
                console.log(result.data.get('Email').toLowerCase());
                console.log(EmailOrMobile.toLowerCase());

                

                if(result.data.get('Email').toLowerCase()==EmailOrMobile.toLowerCase()){
                    user.RecoverType=false;
                    user.RecoverHash=SecurityManager.generateRandomString(64);
                }
                else{
                    user.RecoverType=true;
                    user.RecoverHash=SecurityManager.generateRandomString(8,/\d/);
                }

                _repository.UserRepository.update(user,function(result){
                    if(result.error){
                        callback(result);
                    }
                    else{
                        result.data={"RecoverType":user.RecoverType};

                        if(!user.RecoverType){
                            //var mailOptions=new CoreModels.MailOptions(ConfigurationManager.getEmailConfiguration().auth.user,user.Email,'Account recovery','Your recovery link is: ',_this.ForgotEmailTemplate(ConfigurationManager.getWebURI()+'RecoverAccount/'+user.RecoverHash+'/'+user.Email));
                        
                            NotificationManager.sendEmail(mailOptions);
                        }

                        callback(result)
                    }
                });                    
            }
        });
    },
    verifyMobile:function(user,callback){


        var _this=this;
        _this.getById(user._id,function(result1){
            if(result1.error)
                    callback(result1);
                else{
                    _profileService.getById(user._id,function(result2){
                        if(result2.error)
                            callback(result2);
                        else{

                            if(result2.data.Status==3){
                                if(result1.data.MobileVerificationOTP==user.MobileVerificationOTP  && result1.data.TempMobile==user.Mobile){
                                    _this.update(user,function(result3){
                                        _profileService.update({_id:user._id,Status:4,IsActive:1},function(result4){
                                            callback(result1);
                                        });
                                    });
                                }
                                else{
                                    callback({error:true,data:'Invalid details.'});
                                }
                            }
                            else{
                                callback({error:true,data:'Mobile already Verified.'});
                            }
                        }
                    });
                }
           });
    },
    RecoverPassword:function(user,callback){
        _repository.UserRepository.getByEmailOrMobile(user.Email,function(result){
            if(result.error)
                callback(result);
            else{


                console.log(user.RecoverType);
                console.log(result.data.get('RecoverTimeStamp'));
                console.log(new Date(new Date().toUTCString()));

                if(result.data.get('RecoverTimeStamp')>new Date(new Date().toUTCString())){
                    var hashedPassword=SecurityManager.saltHashPassword(user.Password);
                    user.PasswordHash=hashedPassword.passwordHash;
                    user.Salt=hashedPassword.salt;
                    user.RecoverHash=' ';
                    user.RecoverTimeStamp=null;
                    user._id=result.data.get('_id');

                    console.log(user);
                    _repository.UserRepository.update(user,function(result){
                        callback(result);
                    });
                }
                else{
                    callback({error:true,data:'Unable to recover.'});
                }
            }
        });
    },
    ForgotEmailTemplate:function(recoveryLink){
        return '<div class="maincontainer" style="box-sizing: border-box;background:#cccacab0;  width:100%;  height:auto;  padding:10px;">	<div class="Detailscontainer" style="margin-top:20px;  width:90%;  background:white;  margin:auto;  box-shadow: 7px 7px 5px -5px gray;  padding:0px 20px 0px 20px;"> 		<div class="Details" style="box-sizing: border-box;padding:5px 50px 0px 20px;  height:60px;  width:100%;">			<p style=\'font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;"\'>To reset your password for GT, please follow the <a href="'+recoveryLink+'">link</a> below: <p>'+recoveryLink+' </p></p>		</div> 	</div></div>'
    }


};
module.exports=Service;


