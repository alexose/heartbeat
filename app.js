/*jshint laxcomma: true */
var http = require('http')
  , url  = require('url')
  , fs   = require('fs')
  , log  = require('npmlog');

log.enableColor();

log.level = "verbose";

var port = process.argv && process.argv.length > 2 ? process.argv[2] : 3000;

// Load config
try {
  var options = require('./config/config.js');
} catch(e){
  require('./setup.js')(init);
  return;
}

var heartbeat = require('./lib/heartbeat')(options);

init();

// Set up HTTP server
function init(){

  http
    .createServer(main)
    .listen(port, function(){
      log.info('Server running on port ' + port);
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

    // Add useragent & address
    obj.useragent = request.headers['user-agent'];
    obj.address   = request.connection.remoteAddress;

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
      "Content-Type": type
    });
    response.write(string + '\n');
    response.end();
  }
}

