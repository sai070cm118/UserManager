

var ConfigurationManager=require('../Utilities/Configuration/index');

var dbConfig = {
  client: 'mysql',
  connection: ConfigurationManager.getMySqlDbConfiguration()
};

dbConfig.connection.typeCast= function(field, next) {
    if (field.type == "BIT" && field.length == 1) {
        var bit = field.string();

        if(bit === null) 
            return false;
        else if(bit.charCodeAt(0)==1)
            return true;
        else
            return false;
    }

    // handle everything else as default
    return next();
}

var mongoose = require('mongoose');
mongoose.connect(ConfigurationManager.getMongoConversationConnectionString());

mongoose.connection.on('error',function (err) {  
    console.log('Mongoose connection error: ' + err);
});

process.on('SIGINT', function() {  
    mongoose.connection.close(function () { 
        console.log('Mongoose connection disconnected through app termination'); 
    }); 
}); 

var knex = require('knex')(dbConfig);
var bookshelf = require('bookshelf')(knex);

var Profile=bookshelf.Model.extend(
    {
        tableName:'profile',
        idAttribute: '_id',
        user: function() {
            return this.hasOne(User,'_id');
        }
    }
);
var Profiles=bookshelf.Collection.extend({model:Profile});

var User=bookshelf.Model.extend(
    {
        tableName:'user',
        idAttribute: '_id',
        UserDetails: function() {
            return this.belongsTo(Profile,'_id');
        }
	}
);	
var Users=bookshelf.Collection.extend({model:User});


var Token=bookshelf.Model.extend(
    {
        tableName:'token',
        idAttribute: '_id'
	}
);	
var Tokens=bookshelf.Collection.extend({model:Token});


var UserSchema = new mongoose.Schema({
    FirstName:String,
    LastName:String,
    ProfileName: String,
    ProfilePic: String
});
var UserModel=mongoose.model('User', UserSchema);

var Models={

    //Account Models
    User:User,
    Users:Users,
    Profile:Profile,
    Profiles:Profiles,
    Token:Token,
    Tokens:Tokens,

    //Mongo Models
    UserModel:UserModel,
    DbConfig:dbConfig,
    bookshelf:bookshelf
    
};
module.exports=Models;