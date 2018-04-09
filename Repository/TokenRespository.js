var Models=require('./Models.js');
var moment = require('moment');

var Repository={
    
    add:function(token,callback){
        
        Models.Token
            .forge({
                userId: token.UserId || '',
                RefreshToken: token.RefreshToken || '',
                Sessiontoken: token.SessionToken,
                UserAgent: token.UserAgent || '',
                DeviceId: token.DeviceId || '',
                IsMobile: token.IsMobile || '',
                Details: token.Details || '',
            })
            .save()
            .then(function (Token) {
                callback({error: false, data: {Id: Token.get('Id')}});
            })
            .catch(function (err) {
                callback({error: true, data: {message: 'Add failed for token.'}});
            }); 
    },
    Update:function(token,callback){
        
        
        Models.Token
        .forge({_id: token._id})
        .fetch()
        .then(function(model) {
            model.set({
                SessionToken: token.SessionToken || model.get('SessionToken')
            })
            .save()
            .then(function () {
                callback({error: false, data: 'Token refreshed'});
            })
            .catch(function (err) {
                console.log(err);
                callback({error: true, data: {message: 'Token refresh failed.'}});
            });
        });



    },
    Delete:function(refreshToken,callback){
        Models.Token
        .forge({RefreshToken: refreshToken})
        .fetch()
        .then(function (Token) {
            Token.destroy()
            .then(function () {
                callback({error: false, data: {message: 'Token successfully deleted'}});
            })
            .catch(function (err) {
                callback({error: true, data: {message: err.message}});
            });
        })
        .catch(function (err) {
            console.log(err);
            callback({error: true, data: {message: 'Delete failed for token.'}});
        });
    },
    GetByRefreshToken(refreshToken,callback){

        
        Models.Token
            .forge({RefreshToken: refreshToken})
            .fetch()
            .then(function (token) {
                if (!token) {
                    callback({error: true, data: {}});
                }
                else {
                    callback({error: false, data: token.toJSON()});
                }
            })
            .catch(function (err) {
                console.log(err);
                callback({error: true, data: {message: 'Unable to get token info.'}});
            });
    },
    GetBySessionToken(sessionToken,callback){

        
        Models.Token
            .forge({SessionToken: sessionToken})
            .fetch()
            .then(function (token) {
                if (!token) {
                    callback({error: true, data: {}});
                }
                else {
                    callback({error: false, data: token.toJSON()});
                }
            })
            .catch(function (err) {
                console.log(err);
                callback({error: true, data: {message: 'Unable to get token info.'}});
            });
    }

}


module.exports=Repository;