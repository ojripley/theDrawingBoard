class ActiveUsers {
  // users will be added by the server as keys



  // -- -- -- -- -- -- //
  // methods           //

  addUser(id, client, cookie) {
    this[id] = { id: id, socket: client, cookie: cookie };
  }

  removeUser(id) {
    delete this[id];
  }
};

module.exports = { ActiveUsers };
