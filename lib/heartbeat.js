/*jshint laxcomma:true*/

var nodemailer = require('nodemailer')
  , validator = require('validator')
  , log = require('npmlog');

module.exports = function(options){

  try {
    this.transport = nodemailer.createTransport("SMTP", options);
  } catch(e){
    log.error("Couldn't start nodemailer.  Did you run npm install?");
  }

  return main;
};

function main(obj, cb){

  if (validate()){
    var timeout = setTimeout(send, obj.time * 1000);
  }

  function send(){
    transport.sendMail({
      from : 'Heartbeat',
      to : obj.email,
      subject : 'Heartbeat Alert:',
      text : 'Your alert.',
      html : '<b>Your alert.</b>',
    }, cb);
  }

  function clear(){

  }

  function validate(){

    if (!validator.isEmail(obj.email)){
      cb({ error : 'Invalid Email address.' });
      return false;
    }

    return true;
  }

}
