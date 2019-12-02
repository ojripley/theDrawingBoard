const { generateClientError } = require('./generateClientError');

const handleError = function(error, client) {

  console.log('\n\n\nHear ye!\n\nGerald the Error Herald says:');
  console.log(error);
  console.log('\n\n\nGerald the Error Herald has spoken.');

  const clientError = generateClientError(error);

  if (client) {
    console.log('sending error');
    client.emit('somethingWentWrong', clientError);
  }
}

module.exports = { handleError }
