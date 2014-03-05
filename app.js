var http = require('http')
  , url = require('url')
  , fs = require('fs')
  , querystring = require('querystring');

var port = process.argv && process.argv.length > 2 ? process.argv[2] : 3000;

// Load config
try {
  var options = require('./config/config.js');
  init();
} catch(e){
  require('./setup.js')(init);
}

function init(){

  // Set up HTTP server
  http
    .createServer(main)
    .listen(port, function(){
      console.log('Server running on port ' + port);
    });

  // Set up nodemailer
  var transport = nodemailer.createTransport("SMTP", config);
}

function main(request, response){
  var arr = request.url.split('/');

  if (arr.length < 2 || arr[1] === ''){
    explain(request, response);
  } else {
    arr.shift();
    heartbeat(arr, response);
  }

  function explain(){

    // Load HTML template
    try{
      fs.readFile('README.md', 'utf8', function(err, html){
        respond(html);
      });
    } catch(e){
    }
  }

  function heartbeat(arr){
    respond('You requested ' + arr.join(','));
  }

  function respond(string, type, code){

    type = type || "text/plain";
    code = code || 200;

    response.writeHead(code, {
      "Content-Type": type
    });
    response.write(string);
    response.end();
  }

}
