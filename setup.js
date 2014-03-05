var fs = require('fs');

module.exports = function setup(cb){

  print("It looks like you haven't set up your SMTP server.  Let's do that now.");

  var steps = [
    ["SMTP Server: ", "smtp"],
    ["Port: ",        "port"],
    ["Username: ",    "username"],
    ["Password: ",    "password"]
  ];

  var config = {};

  go(0);

  function go(pos){
    if (pos < steps.length){
      var step = steps[pos].concat([pos + 1]);

      ask.apply(this, step);
    } else {

      // Write to file
      fs.writeFile(
        './config/config.js',
        'module.exports = ' + JSON.stringify(config),
        cb
      );
    }
  };

  function ask(str, key, pos){

    var stdin  = process.stdin
      , stdout = process.stdout;

    print(str, true);
    stdin.resume();
    stdin.setEncoding('utf8');

    stdin.once('data', function(data){
      data = data.toString().trim();

      config[key] = data;
      go(pos);
    });
  }

  function print(str, n){
    n = n ? '' : '\n';
    process.stdout.write(str + n);
  }
};
