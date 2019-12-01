// default error object
const clientError = {
  type: 'default',
  msg: 'Sorry, we had an error! Please refresh the page'
};

const generateClientError = function(error) {

  if (error.table === 'users') {
    return handleUsersError(error);
  } else {
    return clientError;
  }
};

const handleUsersError = function(error) {

  clientError.type = 'login';

  switch(error.constraint) {
    case 'users_username_key':
      clientError.msg = 'Sorry, that username is already taken!';
      break;
    case 'users_email_key':
      clientError.msg = 'There is already an account with that email address!';
      break;
    default:
      clientError.type = 'default';
      break;
  }

  return clientError;
}

module.exports = { generateClientError };
