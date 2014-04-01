/*jshint laxcomma: true */
var fs = require('fs');

module.exports = function setup(cb){

  print("It looks like you haven't set up your SMTP server.  Let's do that now.");

  var steps = [
    ["Service [e.g., Gmail, SendGrid etc.]", "transport:service"],
    ["Username",                             "transport:auth:user"],
    ["Password",                             "transport:auth:pass"],
    ["From",                                 "from", "heartbeat@heartbeat.com"],
    ["Subject",                              "subject_prefix", "Alert: "],
    ["Body",                                 "body", "Your heartbeat has been removed, and is therefore no longer running."]
  ];

  var config = {};

  go(0);

  function go(pos){
    if (pos < steps.length){
      var step = [pos + 1].concat(steps[pos]);

      ask.apply(this, step);
    } else {

      // Write to file
      fs.writeFile(
        './config/config.js',
        'module.exports = ' + JSON.stringify(config),
        cb
      );
    }
  }

  function ask(pos, str, keypath, defaults){

    var stdin  = process.stdin
      , stdout = process.stdout;

    if (defaults){
      str += ' [' + defaults + ']';
    }
    print(str + ': ', true);
    stdin.resume();
    stdin.setEncoding('utf8');

    stdin.once('data', function(data){
      data = data.toString().trim();

      data = data === '' ? defaults : data;

      record(config, keypath, data);
      go(pos);
    });
  }

  // Handle simple keypaths
  function record(obj, keypath, string){

    var arr = keypath.split(':');

    for (var i in arr){
        var key = arr[i];
        obj[key] = (i == arr.length-1) ? string : (obj[key] || {});
        obj = obj[key];
    }
  }

  function print(str, n){
    n = n ? '' : '\n';
    process.stdout.write(str + n);
  }
};
