var _repository=require('../Repository/index');
var _mongoUserService=require('./MongoUserService');
var _securityManager=require('../Utilities/SecurityManager/index');
var validator = require('validator');
const NotificationManager= require('../Utilities/Notification/index');


var Service={
    Register:function(Profile,callback){

        console.log(Profile);
        try{

            if(Profile.User==undefined)
                callback({error: true, data: {message: 'Please provide valid Details.'}});
            else if(Profile.User.Email==undefined || !validator.isEmail(Profile.User.Email))
                callback({error: true, data: {message: 'Please provide valid Email.'}});
            else if(Profile.User.Email.length>50)
                callback({error: true, data: {message: 'EmailId should not exceed 50 charactors.'}});
            else if(Profile.User.Mobile==undefined || !validator.isMobilePhone(Profile.User.Mobile.toString(),'en-IN'))
                    callback({error: true, data: {message: 'Please provide valid Mobile Number.'}});
            else if(!(/^[a-zA-Z0-9]{6,30}$/).test(Profile.User.Password))
                callback({error: true, data: {message: 'Password should be 6 to 30 alphanumerics.'}});
            else if(Profile.ProfileName==undefined || !(/^[-\w\s]+$/).test(Profile.ProfileName))
                callback({error: true, data: {message: 'Profile Name should contains only alphanumerics.'}});
            else if(Profile.ProfileName.length>50)
                callback({error: true, data: {message: 'Profile name should not exceed 50 charactors.'}});
            else  
            {
                var passwordObj=_securityManager.saltHashPassword(Profile.User.Password)
                Profile.User.Password=passwordObj.passwordHash;
                Profile.User.Salt=passwordObj.salt;

                Profile.User.EmailVerification=_securityManager.generateRandomString(8,'^[0-9]$');
                Profile.User.Mobile=Profile.User.Mobile.toString().substr(Profile.User.Mobile.length - 10);
                Profile.User.MobileVerification=_securityManager.generateRandomString(6,'^[0-9]$');
                

                var profileName=Profile.ProfileName.split('/(?<=^[^ ]+) /');
                Profile.FirstName=profileName[0];
                console.log(profileName.length);
                if(profileName.length==2)
                    Profile.LastName=profileName[1];
                Profile.Email=Profile.User.Email;
                Profile.Mobile=Profile.User.Mobile;

                _mongoUserService.add(Profile,function(result){
                    Profile._Id=result.data._id;
                    console.log(Profile);
                    _repository.ProfileRepository.Register(Profile,function(result){

                        if(!result.error){
                            var mailOptions = {
                                from: 'raviteja.vinnakota6@gmail.com',
                                to: Profile.User.Email,
                                subject: 'Verification Email',
                                text: Profile.User.EmailVerification
                            };
    
                            NotificationManager.sendEmail(mailOptions);

                            //TODO: Need to send the otp to mobile.
                        }

                        callback(result);
                    });


                });
            }
            
        }
        catch(ex){
            console.log(ex);
            callback({error: true, data: {message: 'Please provide valid input.'}});
        }

    },
    add:function(Profile,callback){
        _repository.ProfileRepository.add(Profile,callback);
    },
    update:function(Profile,callback){
        _repository.ProfileRepository.update(Profile,callback);
    },
    delete:function(id,callback){
        _repository.ProfileRepository.delete(id,callback);
    },
    getAll:function(callback){
        _repository.ProfileRepository.getAll(callback);
    },
    getById:function(id,callback){
        _repository.ProfileRepository.getById(id,callback);
    },
    getByName:function(name,callback){
        _repository.ProfileRepository.getByName(name,callback);
    },
    getByEmail:function(email,callback){
        _repository.ProfileRepository.getByEmail(email,callback);
    },
    searchProfile:function(name,callback){
        /*
        _repository.UserGroupRepository.searchProfile(name,function(result){
            
            console.log(result);

            callback(result);

            
            if(result.error)
                callback(result);
            else{
                _repository.ProfileRepository.searchProfile(result.data,function(result){
                    callback(result);
                });
            }
            
        });
        */

        _repository.ProfileRepository.searchProfile([],function(result){
            callback(result);
        });
    }
};
module.exports=Service;


