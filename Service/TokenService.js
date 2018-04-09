var _repository=require('../Repository/index');

var Service={

    create:function(token,callback){
        _repository.TokenRepository.add(token,callback);
    },
    Refresh:function(token,callback){
        _repository.TokenRepository.Update(token,callback);
    },
    Delete:function(refreshToken,callback){
        _repository.TokenRepository.Delete(refreshToken,callback);
    },
    GetByRefreshToken(refreshToken,callback){
        _repository.TokenRepository.GetByRefreshToken(refreshToken,callback);
    }

}


module.exports=Service;