class ActiveUsers {
  // users will be added by the server as keys



  // -- -- -- -- -- -- //
  // methods           //

  addUser(user, client) {
    this[user.id] = { id: user.id, username: user.username, email: user.email, socket: client };
  }

  removeUser(id) {
    delete this[id];
  }

};

module.exports = { ActiveUsers };
