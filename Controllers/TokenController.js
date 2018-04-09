var express=require('express');
var Router=express.Router();
var _service=require('../Service/index');


Router.route('/').get(function(req,res){

    res.send('Welcome to Token service');
});
  

module.exports=Router;