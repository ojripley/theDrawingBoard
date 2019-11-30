export default function generateErrorMessage(error) {

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


  switch(error.constraint) {
    case 'users_username_key':
      return 'Sorry, that username is already taken!';
    case 'users_email_key':
      return 'Hmm, it seems there is already an account with that email address';
    default:
      return 'Sorry, we had an error! Please refresh the page';
  }
}

const handleMeetingsError = function (error) {

  switch (error.constraint) {
    case '':
      return '';
    case '':
      return '';
    default:
      return 'Sorry, we had an error! Please refresh the page';
  }
}

const handleUsersMeetingsError = function (error) {

  switch (error.constraint) {
    case '':
      return '';
    case '':
      return '';
    default:
      return 'Sorry, we had an error! Please refresh the page';
  }
}

const handleFriendsError = function (error) {

  switch (error.constraint) {
    case '':
      return '';
    case '':
      return '';
    default:
      return 'Sorry, we had an error! Please refresh the page';
  }
}

const handleFriendsError = function (error) {

  switch (error.constraint) {
    case '':
      return '';
    case '':
      return '';
    default:
      return 'Sorry, we had an error! Please refresh the page';
  }
}

const handleDmsError = function (error) {

  switch (error.constraint) {
    case '':
      return '';
    case '':
      return '';
    default:
      return 'Sorry, we had an error! Please refresh the page';
  }
}
