var express=require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');

//Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded());
// parse application/json
app.use(bodyParser.json());
// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json'}));
app.use(cors());
app.use('/api',require('./Router'));
app.use(function(err, req, res, next){
  	res.send(500, 'Something broke!');
});
app.listen(process.env.PORT || 4004,function(){
	console.log("Express started at port 4003");
});