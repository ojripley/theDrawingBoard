class ActiveUsers {
  // users will be added by the server as keys



  // -- -- -- -- -- -- //
  // methods           //

  addUser(user, client) {
    this[user.username] = [user, client];
  }

  deleteUser(user) {
    delete this[user.username];
  }
};

module.exports = { ActiveUsers };
