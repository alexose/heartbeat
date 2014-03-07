/*jshint laxcomma: true */
var http = require('http')
  , url  = require('url')
  , fs   = require('fs')
  , log  = require('npmlog');

log.enableColor();

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

    // Map array to an object
    var obj = {}
      , fields = ['email', 'time', 'value', 'minimum', 'maximum'];

    fields.forEach(function(d, i){
      obj[d] = arr[i];
    });

    // Create/update heartbeat
    heartbeat(obj, handle);

    respond('Created heartbeat for ' + obj.email + ' (expires in ' + (obj.time || 0) + ' seconds)' );
  }

  function handle(error, response){
    if (error){
      log.warn("Heartbeat fired, but couldn't send email. " + error.toString());
    } else {
      log.info("Heartbeat fired.");
    }
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
