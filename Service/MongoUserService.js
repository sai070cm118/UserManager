var _repository=require('../Repository/index');

var Service={
    add:function(User,callback){
        _repository.MongoUserRepository.add(User,callback);
    },
    update:function(User,callback){
        _repository.MongoUserRepository.update(User,callback);
    },
    getById:function(Id,callback){
        _repository.MongoUserRepository.getById(Id,callback);
    },
    getByName:function(name,callback){
        _repository.MongoUserRepository.getByName(name,callback);
    }
};
module.exports=Service;


