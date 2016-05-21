/*jshint laxcomma:true*/
var nodemailer = require('nodemailer')
  , validator  = require('validator')
  , log        = require('npmlog')
  , crypto     = require('crypto');

var quota = 20; // Number of emails allowed per day, per IP

module.exports = function(options){

  try {
    this.transport = nodemailer.createTransport("SMTP", options.transport);
  } catch(e){
    log.error("Couldn't start nodemailer.  Did you run npm install?");
  }

  this.options = options;
  this.storage = require('./storage.js'); 

  return main;
};

function main(obj, cb){

  if (validate()){
    go();
  }

  // TODO: Revisit the way this flows.  It's ugly.
  function go(){

    var id = hash(obj, 'email', 'useragent', 'address')
      , result = storage[id];

    typeof(obj.time) !== 'undefined' ? upsert() : check();

    function check(){

      if (result){

        // Handle cancellation request
        if (obj.cancel){

          remove(id);
          cb(null, 'Cancelled heartbeat.');
          return;
        }

        cb(null, 'Heartbeat running. ' + expires(timeLeft(result.timeout)));
      } else {

        cb(null, 'There is no heartbeat running for this client.');
      }
    }

    function upsert(){

      var value = obj.value
        , coerce = validator.toFloat
        , min = obj.min || (result ? result.obj.min : null)
        , max = obj.max || (result ? result.obj.max : null)
        , string;

      min = coerce(min);
      max = coerce(max);

      // If there's a value, see if it falls outside of the established bounds.
      if (!isNaN(value)){

        value = parseFloat(value, 10);

        if (!isNaN(min) && value < min){
          string = 'Heartbeat value (' + value + ') below minimum (' + min + ') for heartbeat + ' + id;
        }

        if (!isNaN(max) && value > max){
          string = 'Heartbeat value (' + value + ') above maximum (' + max + ') for heartbeat + ' + id;
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

        cb(null, 'Updated heartbeat ' + id + ' ' + expires());
      } else {
        cb(null, 'Created new heartbeat with id ' + id + ' ' + expires());
      }

      if (obj.time){
        storage[id] = {
          obj:     obj,
          timeout: setTimeout(send, obj.time * 1000)
        };
      } else {
        send();
      }
    }

    function expires(time){
      time = time || obj.time;
      return '(expires in ' + time + ' seconds)';
    }

    // Send message
    function send(text){

      text = text || obj.subject || 'Heartbeat expired after ' + obj.time + ' seconds';

      // Check IP quota
      var quotaID = hash(obj, 'address')
        , sends   = storage[quotaID] || 1;

      var string = 'Quota reached for IP ' + obj.address;

      if (sends > quota){
        log.warn(string);
        return;
      } else if (sends == quota){
        text += ' (' + string + ')';
      }

      var settings = {
        from : options.from,
        to : obj.email,
        subject : options.subject_prefix + ' ' + text,
        text : options.body
      };

      transport.sendMail(settings, function(error, response){
        if (error){
          log.error('Could not send alert: ' + error.toString());
        } else {

          // Add to IP quota
          storage[quotaID] = sends + 1;
          setTimeout(function(){
            storage[quotaID] -= 1;
          }, 1000 * 60 * 60 * 24);

          log.info('Alert sent: ' + response.message);
        }
      });

      remove(id);
    }
  }

  function remove(id){
    if (storage[id]){
      clearTimeout(storage[id].timeout);
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
    //('cancel', 'isBoolean');

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
