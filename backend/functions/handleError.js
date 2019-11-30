export default function handleError(error, client || null) {

  console.log(error);

  const msg = generateErrorMessage(error);

  if (client) {
    client.emit(msg, client);
  }
}
