// load .env data into process.env
require('dotenv').config();

// server config
const PORT = process.env.PORT || 8080;
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const morgan = require('morgan');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cookieParser = require('cookie-session');

// this is the object used to manage all running games on the server
// const { activeGames, activePlayers } = require('./objects/managers.js');

// db related operations
// const db = require('../db/queries/queries');

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
// The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.use(cookieParser({ signed: false }));

app.use(bodyParser.urlencoded({ extended: true }));

// page routes --> these will be replaced with routes for the documents
// const loginRoutes = require('../routes/loginRoutes');
// const registerRoutes = require('../routes/registerRoutes');
// const logoutRoutes = require('../routes/logoutRoutes');

// mount above query routes to db
// app.use('/', loginRoutes(db));
// app.use('/', registerRoutes(db));
// app.use('/', logoutRoutes());

// Home page
app.get("/", (req, res) => {

  res.send('testing purposes only');
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});



io.on('connection', (client) => {
  console.log('new client has connected');


});
