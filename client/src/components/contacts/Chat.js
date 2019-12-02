import React from 'react';

import Message from '../Message';

export default function Chat(props) {

  const handleMessage = event => {
    setMessage(event.target.value);
  };

  const handleMessageSend = () => {
    if (message.trim().length > 0) {
      if (props.socketOpen) {
        props.socket.emit('sendDm', { user: props.user, recipientId: props.recipientId, msg: message.trim() });
      }
      console.log('is my drawer open?', openDrawer)
      console.log('unreadMessages for sender:', unreadMessages)
      setMessage('');
    }
  };

  const handleCaret = e => {
    var temp_value = e.target.value;
    e.target.value = '';
    e.target.value = temp_value;
  };

  const handleKeyStroke = event => {
    if (event.charCode === 13) {
      event.preventDefault();
      handleMessageSend();
    }
  };

  return (

  <List id='meeting-chat-container'>
    <div ref={messagesDisplayRef} id='messages-display'>{msgs}</div>
    <ListItem id={`meeting-chat`}>
      <TextareaAutosize
        ref={textareaRef}
        aria-label='empty textarea'
        placeholder='Message'
        value={message}
        className={classes.textareaAutosize}
        onFocus={handleCaret}
        onChange={handleMessage}
        onKeyPress={handleKeyStroke}
        rows='2'
        rowsMax='2'
      />
      <Button variant='text' color='primary' className={classes.sendButton} onClick={handleMessageSend}>Send</Button>
    </ListItem>
  </List>
  )
}
