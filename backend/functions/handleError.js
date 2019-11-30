const { generateErrorMessage } = require('./generateErrorMessage');

const handleError = function(error, client) {

  console.log('\n\n\nHear ye!\n\nGerald the Error Herald says:');
  console.log(error);
  console.log('\n\n\nGerald the Error Herald has spoken.');



  const msg = generateErrorMessage(error);

  if (client) {
    client.emit(msg, client);
  }
}

module.exports = { handleError }
