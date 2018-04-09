
var express=require('express');
var Router=express.Router();

Router.use('/User',require('./Controllers/UserController'));
Router.use('/Profile',require('./Controllers/ProfileController'));
Router.use('/Token',require('./Controllers/TokenController'));


module.exports=Router;
