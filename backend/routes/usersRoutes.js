const router = require("express").Router();

module.exports = (db) => {
  router.get('/users/:id', (req, res) => {
    db.fetchUserByEmail(req.params.id)
      .then((data) => {
        res.json(data[0]);
      })
      .catch(error => {
        console.error(error);
      });
  });

  router.get('/users/:id/friends', (req, res) => {
    db.fetchFriendsById(req.params.id)
      .then((data) => {
        res.json(data);
      })
      .catch(error => {
        console.error(error);
      });
  });

  return router;
};
