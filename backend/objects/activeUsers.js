class ActiveUsers {
  // users will be added by the server as keys



  // -- -- -- -- -- -- //
  // methods           //

  addUser(id, client) {
    // let sid = this.generateSessionId();
    this[id] = { id: id, socket: client };
    // return sid;
  }

  removeUser(id) {
    delete this[id];
  }

};

module.exports = { ActiveUsers };
