var Models=require('./Models.js');
var moment = require('moment');

var Repository={
    add:function(User,callback){
        
        console.log(User);

        Models.User
            .forge({
                _Id: User._id,
                Email: User.Email,
                RegistrationIP: User.RegistrationIP || '',
                RegistrationTime: moment.utc().valueOf(),
                EmailVerification: User.EmailVerification || '',

                PasswordHash: User.PasswordHash || '',
                Salt: User.Salt || '',
                
                Mobile: User.Mobile || '',
                TempMobile:User.TempMobile || '',
                MobileVerificationOTP: User.MobileVerificationOTP || '',

                GooglePlus: User.GooglePlus || '',
                FacebookID: User.FacebookID || '',

                KeepMe: User.KeepMe || '',
                
                RecoverType: User.RecoverType || false,
                RecoverHash: User.RecoverHash || '',
                RecoverTimeStamp: User.RecoverTimeStamp || ''
            })
            .save()
            .then(function (User) {
                callback({error: false, data: {Id: User.get('Id')}});
            })
            .catch(function (err) {
                callback({error: true, data: {message: 'Add failed for user.'}});
            }); 
    },
    update:function(User,callback){


        console.log(User);
        Models.User
        .forge({_id: User._id})
        .fetch()
        .then(function(model) {

            model.set({
                EmailVerification: User.EmailVerification || model.get('EmailVerification'),

                PasswordHash: User.PasswordHash || model.get('PasswordHash'),
                Salt: User.Salt || model.get('Salt'),
                
                Mobile: User.Mobile || model.get('Mobile'),
                MobileVerification: User.MobileVerification || model.get('MobileVerification'),

                KeepMe: User.KeepMe || model.get('KeepMe'),
                
                RecoverType: User.RecoverType != undefined  ? User.RecoverType : model.get('RecoverType'),
                RecoverHash: User.RecoverHash || model.get('RecoverHash'),
                TimeStamp: User.TimeStamp || model.get('TimeStamp'),
            })
            .save()
            .then(function () {
                callback({error: false, data:{message:  'User details updated'}});
            })
            .catch(function (err) {
                console.log(err);
                callback({error: true, data: {message: 'Update failed for User.'}});
            });
        });
    },
    delete:function(id,callback){
        Models.User
            .forge({_id: id})
            .fetch({require: true})
            .then(function (User) {
                Models.user.destroy()
                .then(function () {
                    callback({error: false, data: {message: 'User successfully deleted'}});
                })
                .catch(function (err) {
                    callback({error: true, data: {message: err.message}});
                });
            })
            .catch(function (err) {
                callback({error: true, data: {message: 'Delete failed for user.'}});
            });
    },
    getAll:function(callback){
        Models.Users
            .forge()
            .fetch({withRelated:['UserDetails']})
            .then(function (collection) {
                callback({error: false, data: collection.toJSON()});
            })
            .catch(function (err) {
                callback({error: true, data: {message: 'Unable to get users.'}});
            });
    },
    getById:function(id,callback){
        
        Models.User
            .forge({_id: id})
            .fetch()
            .then(function (user) {
                if (!user) {
                    callback({error: true, data: {}});
                }
                else {
                    callback({error: false, data: user.toJSON()});
                }
            })
            .catch(function (err) {
                console.log(err);
                callback({error: true, data: {message: 'Unable to get user.'}});
            });
    },
    getByEmail:function(Email,callback){
       Models.User
            .forge({Email: Email})
            .fetch()
            .then(function (User) {
                if (!User) {
                    callback({error: true, data: {}});
                }
                else {
                    callback({error: false, data: User.toJSON()});
                }
            })
            .catch(function (err) {
                callback({error: true, data: {message: 'Unable to get user.'}});
            });
    },
    getByEmailOrMobile:function(email,mobile,callback){
        Models.User
            .query(function(qb) {
                qb.where('Email', '=', email).orWhere('Mobile', '=', mobile);
            })
            .fetch()
            .then(function (User) {
                if(User!=null)
                    callback({error: false, data: User});
                else
                    callback({error: true, data: 'User not found with the Email/Mobile.'});
            })
            .catch(function (err) {
                callback({error: true, data: {message: 'Unable to get User.'}});
            });
    },
    getByEmailVerificationToken: function (emailVerificationToken, callback) {
        Models.User
        .forge({EmailVerification: emailVerificationToken})
        .fetch()
        .then(function (User) {
            callback({error: false, data: User});
        })
        .catch(function (err) {
            callback({error: true, data: {message: 'Unable to get User with the verificatioon token.'}});
        });
    },
    getByRecoveryToken: function (recoverHash, callback) {
        Models.User
        .forge({RecoverHash: recoverHash})
        .fetch()
        .then(function (User) {
            callback({error: false, data: User});
        })
        .catch(function (err) {
            callback({error: true, data: {message: 'unable to get details by recover token.'}});
        });
    }
};
module.exports=Repository;