const { generateClientError } = require('./generateClientError');

const handleError = function(error, client) {

  // log entire error to server console
  console.log('\n\n\nHear ye!\n\nGerald the Error Herald says:');
  console.log(error);
  console.log('\n\n\nGerald the Error Herald has spoken.');

  // generate a concise error to send to the client
  const clientError = generateClientError(error);

  if (client) {
    console.log('sending error');
    client.emit('somethingWentWrong', clientError);
  }
}

module.exports = { handleError }
