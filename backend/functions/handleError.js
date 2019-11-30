export default function handleError(error, client) {

  console.log(error);

  const error = generateErrorMessage(error);

  if (client) {
    client.emit(msg, client);
  }
}
