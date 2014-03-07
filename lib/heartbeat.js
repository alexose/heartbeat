/*jshint laxcomma:true*/
var nodemailer = require('nodemailer')
  , validator  = require('validator')
  , log        = require('npmlog')
  , crypto     = require('crypto');

module.exports = function(options){

  try {
    this.transport = nodemailer.createTransport("SMTP", options);
  } catch(e){
    log.error("Couldn't start nodemailer.  Did you run npm install?");
  }

  this.storage = {};

  return main;
};

function main(obj, cb){

  if (validate()){
    var timeout = setTimeout(send, obj.time * 1000)
      , id = hash(obj);

  }

  function send(){

    transport.sendMail({
      from:    'Heartbeat',
      to:      obj.email,
      subject: 'Heartbeat Alert:',
      text:    'Your alert.',
      html:    '<b>Your alert.</b>',
    }, cb);
  }

  function clear(){

  }

  function validate(){

    var valid = true;

    required('email', 'isEmail');
    optional('time',  'isNumeric');
    optional('value', 'isNumeric');
    optional('min',   'isNumeric');
    optional('max',   'isNumeric');

    return valid;

    function required(prop, method){
      if (!validator[method](obj[prop])){
        cb(new Error('"' + obj[prop] + '" is not a valid ' + prop + '.'));
        valid = false;
      }
    }

    function optional(prop, method){
      if (obj[prop]){
        return required(prop, method);
      }
    }
  }

  function hash(obj){

    var string = JSON.stringify(obj)
      , result = crypto.createHash('md5').update(string).digest('hex')
      , prefix = 'h-';

      return prefix + result;
  }

}
