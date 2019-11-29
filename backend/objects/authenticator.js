const db = require('../db/queries/queries');
const bcrypt = require('bcrypt');

class Authenticator {

  authenticate(email, password) {
    return db.fetchUserByEmail(email)
      .then(user => {
        if (user && user[0] && bcrypt.compareSync(password, user[0].password)) {
          console.log('login attempt: success');
          return {
            id: user[0].id,
            email: user[0].email,
            username: user[0].username
          }
        } else {
          return false;
        }
      });
  }

  register(username, email, password) {

    hashedPassword = bcrypt.hashSync(password, 10);

    return db.insertUser(username, email, hashedPassword)
      .then(user => {
        return user;
      });
  }
}

module.exports = { Authenticator };
