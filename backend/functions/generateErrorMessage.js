export default function generateErrorMessage(error) {

  if (error.table = users) {
    return handleUsersError(error);
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
