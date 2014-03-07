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
    go();
  }

  function go(){

    var id = hash(obj, 'email', 'useragent')
      , result = storage[id];

    obj.time ? upsert() : check();

    function check(){

      result ?
        cb(null, 'Heartbeat running. ' + expires(timeLeft(result))) :
        cb(null, 'There is no heartbeat running for this email and user-agent.');
    }

    function upsert(){

      insert();
      clearTimeout(result);

      result ?
        cb(null, 'Updated heartbeat. ' + expires()) :
        cb(null, 'Created new heartbeat. ' + expires());

      function insert(){
        storage[id] = setTimeout(send, obj.time * 1000);
      }
    }

    function expires(time){
      time = time || obj.time;
      return '(expires in ' + time + ' seconds)';
    }

    // Send message
    function send(){

      remove(id);
      transport.sendMail({
        from:    'Heartbeat',
        to:      obj.email,
        subject: 'Heartbeat Alert:',
        text:    'Your alert.',
        html:    '<b>Your alert.</b>',
      }, cb);
    }
  }

  function remove(id){
    if (storage[id]){
      delete storage[id];
    }
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

}

// Usage : hash(object, property1, property2, property3..)
function hash(){

  var args = Array.prototype.slice.call(arguments, 0)
    , obj = args.shift();

  var newObj = {};
  args.forEach(function(d){
    newObj[d] = obj[d];
  });

  var string = JSON.stringify(newObj)
    , result = crypto.createHash('md5').update(string).digest('hex')
    , prefix = 'h-';

    return prefix + result;
}

// via http://stackoverflow.com/questions/3144711
function timeLeft(timeout) {
  return Math.ceil((timeout._idleStart + timeout._idleTimeout - Date.now()) / 1000);
}
