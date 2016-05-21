var pg = require('pg');
var config = require('../config.js');
var storage = {};

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
  client.query('SELECT NOW() AS "theTime"', function(err, result) {
    if (err){
      return console.error('error running query', err);
    }
    console.log(result.rows[0].theTime);
  });
});

function set(id, data){
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
