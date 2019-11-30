export default function generateErrorMessage(error) {

  switch (error.table) {
    case 'users':
      return handleUsersError(error);
      break;
    case 'meetings':
      return handleMeetingsError(error);
      break;
    case 'users_meetings':
      return handleUsersMeetingsError(error);
      break;
    case 'friends':
      return handleUsersMeetingsError(error);
      break;
    case 'notifications':
      return handleUsersMeetingsError(error);
      break;
    case '':
      return handleUsersMeetingsError(error);
      break;
  }
};

const handleUsersError = function(error) {

  if (error.constraint === 'users_username_key') {
    return 'Sorry, that username is already taken!';
  }

  if (error.constraint === 'users_email_key') {
    return 'Hmm, it seems there is already an account with that email address';
  }
}
