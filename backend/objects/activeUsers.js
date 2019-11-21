class ActiveUsers {
  // users will be added by the server as keys



  // -- -- -- -- -- -- //
  // methods           //

  addUser(username, client) {
    this[username] = [username, client];
  }

  deleteUser(user) {
    delete this[user.username];
  }
};

module.exports = { ActiveUsers };
