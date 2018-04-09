var _repository=require('../Repository/index');
var _mongoUserService=require('./MongoUserService');
var _securityManager=require('../Utilities/SecurityManager/index');
var validator = require('validator');


var Service={
    Register:function(Profile,callback){
        
        if(Profile.User.Email == null && Profile.User.Mobile == null)
            callback({error: true, data: {message: 'Please register with either Email or Mobile.'}});
        else {

            if(Profile.User.Password!=null){
                var passwordObj=_securityManager.saltHashPassword(Profile.User.Password)
                Profile.User.Password=passwordObj.passwordHash;
                Profile.User.Salt=passwordObj.salt;
            }


            if(Profile.User.Email != null && validator.isEmail(Profile.User.Email)){
                Profile.User.EmailVerification=_securityManager.generateRandomString(64);

                _mongoUserService.add(Profile,function(result){

                    Profile._Id=result.data._id;
                    _repository.ProfileRepository.Register(Profile,callback);

                });
            }
            else if(Profile.User.Mobile != null && validator.isMobilePhone(Profile.User.Mobile,'en-IN')){

                Profile.User.Mobile=Profile.User.Mobile.substr(Profile.User.Mobile.length - 10);
                Profile.User.MobileOtp=_securityManager.generateRandomString(6,'^[0-9]$');

                _mongoUserService.add(Profile,function(result){

                    Profile._Id=result.data._id;
                    _repository.ProfileRepository.Register(Profile,callback);

                });

            }
            else{
                callback({error: true, data: {message: 'Invalid Email or Mobile.'}});
            }
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


