var http = require('http')
  , url = require('url')
  , fs = require('fs')
  , querystring = require('querystring')
  , nodemailer = require('nodemailer')
  , validator = require('validator');

var port = process.argv && process.argv.length > 2 ? process.argv[2] : 3000;

// Load config
try {
  var options = require('./config/config.js');
} catch(e){
  require('./setup.js')(init);
  return;
}

try {
  // Set up nodemailer
  var transport = nodemailer.createTransport("SMTP", options);
} catch(e){
  console.log("Couldn't start nodemailer.  Did you run npm install?");
}

init();
function init(){

  // Set up HTTP server
  http
    .createServer(main)
    .listen(port, function(){
      console.log('Server running on port ' + port);
    });

}

function main(request, response){
  var arr = request.url.split('/');

  if (arr.length < 2 || arr[1] === ''){
    explain(request, response);
  } else {
    arr.shift();
    process(arr, response);
  }

  function explain(){

    // Load HTML template
    try {
      fs.readFile('README.md', 'utf8', function(err, html){
        respond(html);
      });
    } catch(e){
      respond("Couldn't find README.md.", 404);
    }
  }

  function process(arr){

    var obj = {}
      , fields = ['email', 'time', 'value', 'minimum', 'maximum'];

    fields.forEach(function(d, i){
      obj[d] = arr[i];
    });

    if (validate(obj)){
      heartbeat(obj, handle);
    }

    respond('Created heartbeat for ' + obj.email);
  }

  function handle(error, response){
    if (error){
      console.log("Heartbeat fired, but couldn't send email. " + error.toString());
    } else {
      console.log("Heartbeat fired.");
    }
  }

  function validate(obj){

    if (!validator.isEmail(obj.email)){
      respond('Invalid Email address.', 400);
      return false;
    }

    return true;
  }

  function respond(string, code, type){

    code = code || 200;
    type = type || "text/plain";

    response.writeHead(code, {
      "Content-Type": type
    });
    response.write(string);
    response.end();
  }
}

function heartbeat(obj, cb){

    var timeout = setTimeout(send, obj.time * 1000);

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
}

