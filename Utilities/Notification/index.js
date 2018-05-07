
const nodemailer = require('nodemailer');

var ConfigurationManager = require('../Configuration/index');

// create reusable transporter object using the default SMTP transport
//let transporter = nodemailer.createTransport(ConfigurationManager.getEmailConfiguration());
let transporter = nodemailer.createTransport(
    {
        service: 'gmail',
        auth: {
          user: 'raviteja.vinnakota6@gmail.com',
          pass: '#TEJA#TEJA#!@#'
        },
        tls: { rejectUnauthorized: false }
    }
);


// setup email data with unicode symbols


// send mail with defined transport object



function sendEmail (mailOptions) {

    console.log(mailOptions);

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
};


module.exports={sendEmail:sendEmail};