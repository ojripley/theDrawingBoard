// default error object
const clientError = {
  type: 'default',
  msg: 'Sorry, we had an error! Please refresh the page'
};

const generateClientError = function(error) {

  switch (error.table) {
    case 'users':
      return handleUsersError(error);
    case 'meetings':
      return handleMeetingsError(error);
    case 'users_meetings':
      return handleUsersMeetingsError(error);
    case 'friends':
      return handleFriendsError(error);
    case 'notifications':
      return handleNotificationsError(error);
    case 'dms':
      return handleDmsError(error);
  }
};

const handleUsersError = function(error) {

  clientError.type = 'login';

  switch(error.constraint) {
    case 'users_username_key':
      clientError.msg = 'Sorry, that username is already taken!';
      break;
    case 'users_email_key':
      clientError.msg = 'hmm, there is already an account with that email address!';
      break;
    default:
      clientError.type = 'default';
      break;
  }

  return clientError;
}

const handleMeetingsError = function (error) {

  switch (error.constraint) {
    case '':
      clientError.msg = '';
    case '':
      clientError.msg = '';
      break;
    default:
      clientError.type = 'defualt';
      break;
  }

  return clientError;
}

const handleUsersMeetingsError = function (error) {

  switch (error.constraint) {
    case '':
      clientError.msg = '';
      break;
    case '':
      clientError.msg = '';
      break;
    default:
      clientError.type = 'defualt';
      break;
  }

  return clientError;
}

const handleFriendsError = function (error) {

  switch (error.constraint) {
    case '':
      clientError.msg = '';
      break;
    case '':
      clientError.msg = '';
      break;
    default:
      clientError.type = 'defualt';
      break;
  }

  return clientError;
}

const handleNotificationsError = function (error) {

  switch (error.constraint) {
    case '':
      clientError.msg = '';
      break;
    case '':
      clientError.msg = '';
      break;
    default:
      clientError.type = 'defualt';
      break;
  }

  return clientError;
}

const handleDmsError = function (error) {

  switch (error.constraint) {
    case '':
      clientError.msg = '';
      break;
    case '':
      clientError.msg = '';
      break;
    default:
      clientError.type = 'defualt';
      break;
  }

  return clientError;
}

module.exports = { generateClientError };
