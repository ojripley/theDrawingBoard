class ActiveUsers {
  // users will be added by the server as keys



  // -- -- -- -- -- -- //
  // methods           //

  addUser(username, client) {
    this[username] = {username: username, socket: client};
  }

  removeUser(username) {
    delete this[username];
  }
};

module.exports = { ActiveUsers };
