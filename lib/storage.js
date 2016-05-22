var pg = require('pg');
var config = require('../config.js');
var storage = {};
var log = require('npmlog');

// via http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

var string = "postgres://{{username}}:{{password}}@{{host}}/{{database}}"
  .replace('{{username}}', config.postgres.username)
  .replace('{{password}}', config.postgres.password)
  .replace('{{host}}',     config.postgres.host)
  .replace('{{database}}', config.postgres.database);

var client = new pg.Client(string);

client.connect(function(err){
  if (err){
    return console.error('Could not connect to postgres', err);
  }
});

function set(id, data){

  var obj = data.obj;
    
  // Record to database
  try {

    // Upon upsert, postgres will automatically update the "modified" timestamp via a trigger
    /*
    var query = ""
      + "WITH upsert as ("
      +   "UPDATE heartbeats WHERE pid='{{pid}}'" 
      + ")"
      + "INSERT INTO heartbeats ("
      +   "pid, email, agent"
      + ")"
      + "VALUES ('{{pid}}', '{{email}}', '{{agent}}')"
      .replaceAll('{{pid}}', 'placeholder')
      .replaceAll('{{email}}', obj.email)
      .replaceAll('{{agent}}', obj.useragent);
    */
 
    var pid = 'placeholder';
    var query = `
      INSERT INTO heartbeats (
        pid, email, agent
      )
      VALUES ('${pid}', '${obj.email}', '${obj.useragent}')
      ON CONFLICT (id)
      DO UPDATE SET pid = 'eh'
    `;

    console.log(query);
    client.query(query);
  } catch(e){

    // TODO: something with this
    log.warn("Couldn't write to postgres: " + e);
  }

  return storage[id] = data;
};

function get(id){
  return storage[id];
}

function remove(id){
  delete storage[id];
}

module.exports = {
  set:    set,
  get:    get,
  remove: remove
};
