var Models=require('./Models.js');

var Repository={
    add:function(User,callback){
        Models.UserModel.create(User, function (err, UserResult) {
              if (err) {
                  console.log(err);
                callback({error: true, data: {}});
              } 
              else {
                  callback({error: false, data: UserResult.toJSON()});
              }
        });
    },
    update:function(User,callback){
        Models.UserModel.findById(User.Id, function (err, returedUser) {
            if (err) {
                callback({error: true, data: {}});
            } else {
                returedUser.update(User, function (err, UserResult) {
                    if (err) {
                        callback({error: true, data: {}});
                    } 
                    else {
                        Models.UserModel.findById(User.Id,function(err,user){
                            if (err) {
                                callback({error: true, data: {}});
                            } 
                            else {
                                callback({error: false, data: user});
                            }
                        });
                    }
                });
            }
        });
    },
    getById:function(Id,callback){
        Models.UserModel.findById(Id, function (err, UserResult) {
            if (err) {
                  callback({error: true, data: {}});
              } 
              else {
                  callback({error: false, data: UserResult});
              }
        });
    },
    getByName:function(Name){
        Models.UserModel.where('Name').equals(Name, function (err, UserResult) {
            if (err) {
                callback({error: true, data: {}});
            } 
            else {
                callback({error: false, data: UserResult});
            }
        });
    }
};
module.exports=Repository;