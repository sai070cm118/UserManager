
const nodemailer = require('nodemailer');

var ConfigurationManager = require('../Configuration/index');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport(ConfigurationManager.getEmailConfiguration());

// setup email data with unicode symbols


// send mail with defined transport object



function sendEmail (mailOptions) {
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        return 'Message %s sent: %s', info.messageId, info.response;
    });
};


module.exports={sendEmail:sendEmail};