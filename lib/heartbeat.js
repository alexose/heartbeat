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

  // TODO: Revisit the way this flows.  It's ugly.
  function go(){

    var id = hash(obj, 'email', 'useragent')
      , result = storage[id];

    obj.time ? upsert() : check();

    function check(){

      result ?
        cb(null, 'Heartbeat running. ' + expires(timeLeft(result.timeout))) :
        cb(null, 'There is no heartbeat running for this client.');
    }

    function upsert(){

      var value = obj.value
        , coerce = validator.toFloat
        , min = obj.min || (result ? result.obj.min : null)
        , max = obj.max || (result ? result.obj.max : null)
        , string;

      min = coerce(min);
      max = coerce(max);

      // If there's a value, see if it fall outside of the established bounds.
      if (!isNaN(value)){

        value = parseFloat(value, 10);

        if (!isNaN(min) && value < min){
          string = 'Heartbeat value (' + value + ') below minimum (' + min + ')';
        }

        if (!isNaN(max) && value > max){
          string = 'Heartbeat value (' + value + ') above maximum (' + max + ')';
        }
      }

      if (string){
        send(string);
        cb(null, string);
        return;
      }

      if (result){

        obj.min = min;
        obj.max = max;

        clearTimeout(result.timeout);

        cb(null, 'Updated heartbeat. ' + expires());
      } else {
        cb(null, 'Created new heartbeat. ' + expires());
      }

      storage[id] = {
        obj:     obj,
        timeout: setTimeout(send, obj.time * 1000)
      };
    }

    function expires(time){
      time = time || obj.time;
      return '(expires in ' + time + ' seconds)';
    }

    // Send message
    function send(text){

      text = text || 'Heartbeat expired after ' + obj.time + ' seconds';

      remove(id);

      transport.sendMail({
        from:    'Heartbeat',
        to:      obj.email,
        subject: 'Alert: ' + text,
        text:    'Your heartbeat has been removed, and is therefore no longer running.',
        html:    text
      }, function(error, response){
        if (error){
          log.error('Could not send alert: ' + error.toString());
        } else {
          log.info('Alert sent: ' + response.message);
        }
      });
    }
  }

  function remove(id){
    if (storage[id]){
      clearTimeout(storage[id].timeout)
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
