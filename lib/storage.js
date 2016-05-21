var storage = {};

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
