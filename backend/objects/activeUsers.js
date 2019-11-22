class ActiveUsers {
  // users will be added by the server as keys



  // -- -- -- -- -- -- //
  // methods           //

  addUser(id, client) {
    this[id] = {id: id, socket: client};
  }

  removeUser(id) {
    delete this[id];
  }
};

module.exports = { ActiveUsers };
