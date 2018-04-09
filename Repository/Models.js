

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

var knex = require('knex')(dbConfig);
var bookshelf = require('bookshelf')(knex);

var Profile=bookshelf.Model.extend(
    {
        tableName:'Profile',
        idAttribute: '_id',
        User: function() {
            return this.hasOne(User,'_id');
        },
        Account: function() {
            return this.hasOne(Account,'_id');
        }
    }
);
var Profiles=bookshelf.Collection.extend({model:Profile});

var User=bookshelf.Model.extend(
    {
        tableName:'User',
        idAttribute: '_id',
        UserDetails: function() {
            return this.belongsTo(Profile,'_id');
        }
	}
);	
var Users=bookshelf.Collection.extend({model:User});













var UserSchema = new mongoose.Schema({
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


    //Mongo Models
    UserModel:UserModel,
    DbConfig:dbConfig,
    bookshelf:bookshelf
};
module.exports=Models;