
var RandomStringGenerator = require("password-generator");
var crypto = require('crypto');

var ConfigurationManager = require('../Configuration/index');
var NotificationManager = require('../Notification/index');
var nJwt = require('njwt');


//Verifies the token whether the token is valid or not.
function verifyToken(token,verificationCallback){
    nJwt.verify(token||"",ConfigurationManager.getTokenSecret(),function(err,verifiedJwt){
        verificationCallback(err,verifiedJwt) ;
    });
}

//Middleware user on every request after login for Extract the user details form the token which is passend in autherization header.
function extractUserFromToken(req, res, next) {  


    if(req.headers['authorization']==null || req.headers['authorization']==undefined){
        console.log('No autherizaion headr present');
        next();
    }
    else{
        nJwt.verify(req.headers['authorization'],ConfigurationManager.getTokenSecret(),function(err,verifiedJwt){
            
            if(err)
                next();
            else if(verifiedJwt==undefined)
                next();
            else{
                req.body.UserId=verifiedJwt.body.Id;
                next();
            }
        });
    }
 
}

//It will Generates the new token.
function createToken(claims,IsRefresh){

    claims.iat=new Date().getTime();

    var jwt =  nJwt.create(claims,ConfigurationManager.getTokenSecret(),ConfigurationManager.getTokenAlgorithm(0));
   
    
    if(IsRefresh)
        jwt.setExpiration(new Date().getTime() + (ConfigurationManager.getRefreshTokenExpTime()));
    else
        jwt.setExpiration(new Date().getTime() + (ConfigurationManager.getTokenExpTime())); 

   
    return token = jwt.compact();
}

//Register New User
function NewRegistration(profile,callback){

  var passwordObj=saltHashPassword(profile.User.PasswordHash)
  profile.User.PasswordHash=passwordObj.passwordHash;
  profile.User.Salt=passwordObj.salt;
  profile.User.EmailVerification=generateRandomString(64);


}

function SocialLogin(profile,callback){

    profile.User.EmailVerification=generateRandomString(64);

    Login(profile,true,function(err,loginResponse){
        
    });
}

function Login(profile,IsSocialLogin,callback){
    
}

//Generates the random string with the given lenght.
function generateRandomString(length,pattern){
  if(pattern==undefined)
    return RandomStringGenerator(length, false);
  else
    return RandomStringGenerator(length, false,pattern);
}

//Hashes the password with the sald.
function sha512(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};

//Generates the salt and request for password encryption.
function saltHashPassword(userpassword) {
    var salt = generateRandomString(16);
    var passwordData = sha512(userpassword, salt);
    return passwordData;
}



function EmailActivationTemplate(activationLink){
        return '<div class="maincontainer" style="box-sizing: border-box;background:#cccacab0;  width:100%;  height:auto;  padding:10px;">	<div class="Detailscontainer" style="margin-top:20px;  width:90%;  background:white;  margin:auto;  box-shadow: 7px 7px 5px -5px gray;  padding:0px 20px 0px 20px;"> 		<div class="Details" style="box-sizing: border-box;padding:5px 50px 0px 20px;  height:60px;  width:100%;">			<p style=\'font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;"\'>To activate your accout for GT, please follow the <a href="'+activationLink+'">link</a> below:<p> '+activationLink+' </p></p>		</div> 	</div></div>'
    }


//Export the module
module.exports = {
    verifyToken : verifyToken,
    createToken : createToken,
    sha512 : sha512,
    SocialLogin : SocialLogin,
    generateRandomString : generateRandomString,
    saltHashPassword : saltHashPassword,
    extractUserFromToken:extractUserFromToken,
    NewRegistration:NewRegistration,
    Login:Login
}