var pg = require('pg');
var config = require('../config.js');
var storage = {};
var log = require('npmlog');

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

    var query = "INSERT INTO heartbeats (pid, email, agent) VALUES ('{{pid}}', '{{email}}', '{{agent}}')"
      .replace('{{pid}}', 'placeholder')
      .replace('{{email}}', obj.email)
      .replace('{{agent}}', obj.useragent);

    client.query(query);
  } catch(e){
    // TODO: something with this
    log.warn("Couldn't write to postgres.");
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
