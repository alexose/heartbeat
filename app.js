/*jshint laxcomma: true */
var http = require('http')
  , url  = require('url')
  , fs   = require('fs')
  , log  = require('npmlog')
  , portfinder = require('portfinder')
  , validator  = require('validator');

log.enableColor();

// Load config
try {
  var options = require('./config.js');
} catch(e){
  log.error('Please create a config.js.');
  process.exit(1);
}

log.level = 'verbose';

var heartbeat = require('./lib/heartbeat')(options);

init();

// Set up HTTP server
function init(){
  portfinder.getPort(function (err, port){
    http
      .createServer(main)
      .listen(port, function(){
        log.info('Server running on port ' + port);
      });
  });
}

// Handle request, provide README if none given
function main(request, response){
  var arr = request.url.split('/');

  if (arr.length < 2 || arr[1] === ''){
    explain(request, response);
  } else {
    arr.shift();
    process(arr, response);
  }

  function explain(){

    try {
      fs.readFile('README.md', 'utf8', function(err, md){

        // Load README.tmpl and insert markdown
        fs.readFile('README.tmpl', 'utf8', function(err, tmpl){

          var html = tmpl
            .replace('{{name}}', 'Heartbeat - An EKG for your application.')
            .replace('{{readme}}', md);

          respond(html, null, 'text/html');
        });
      });

    } catch(e){
      respond("Couldn't find README.md.", 404);
    }
  }

  function process(arr){

    // Map array to an object
    var obj = {}
      , fields = ['email', 'time', 'value', 'min', 'max'];

    fields.forEach(function(d, i){
      obj[d] = arr[i];
    });

    // Hidden feature:  If "time" isn't numeric, we'll use the string as the subject line and execute the alert immediately.
    if (typeof(obj.time) !== 'undefined'){
      if (!validator.isNumeric(obj.time)){
        obj.subject = obj.time;
        obj.time = 0;
      }
    }

    // Add useragent & address
    obj.useragent = request.headers['user-agent'];
    obj.address   = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    // Handle 'cancel' case
    if (obj.time && obj.time === 'cancel'){
      obj.cancel = true;
      delete obj.time;
    }

    // Create/update heartbeat
    heartbeat(obj, handle);
  }

  function handle(error, response){
    if (error){
      var string = "There was a problem with your request. " + error.toString();
      respond(string, 400);
    } else {
      respond(response);
    }
  }

  function respond(string, code, type){

    code = code || 200;
    type = type || "text/plain";

    log.verbose(code + ': ' + string);

    response.writeHead(code, {
      "Content-Type": type,
      "Content-Length": string.length
    });
    response.write(string + '\n');
    response.end();
  }
}
