var pg = require('pg');
var config = require('../config.js');
var storage = {};
var log = require('npmlog');

// via http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

var o = config.postgres;
var string = `postgres://${o.username}:${o.password}@${o.host}/${o.database}`;
var client = new pg.Client(string);

client.connect(function(err){
  if (err){
    return console.error('Could not connect to postgres', err);
  }
});

function set(pid, data){

  var obj = data.obj;
    
  // Record to database
  try {

    var query = `
      INSERT INTO heartbeats (
        pid, email, agent, added, updated
      )
      VALUES ('${pid}', '${obj.email}', '${obj.useragent}', 'now', 'now')
      ON CONFLICT (pid)
      DO UPDATE SET updated = 'now'
    `;

    client.query(query);
  } catch(e){

    // TODO: something with this
    log.warn("Couldn't write to postgres: " + e);
  }

  return storage[pid] = data;
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
