var express=require('express');
var Router=express.Router();
var _service=require('../Service/index');



Router.route('/')
  .post(function (req, res) {
    _service.MongoUserService.add(req.body,function(result){
        if(result.error)
            res.status(500).json(result);
        else
            res.json(result.data);
    });
  })
  .put(function (req, res) {
    _service.MongoUserService.update(req.body,function(result){
        if(result.error)
            res.status(500).json(result);
        else
            res.json(result.data);
    });
  });

  
Router.route('/:Id')
  .get(function (req, res) {
       var result= _service.MongoUserService.getById(req.params.Id,function(result){
        if(result.error)
            res.status(500).json(result);
        else
            res.json(result.data);
    });
  });


module.exports=Router;