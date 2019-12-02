import React from 'react';

import Message from '../Message';

export default function Chat(props) {

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const textareaRef = useRef(null);
  const messagesDisplayRef = useRef(null);

  const handleMessage = event => {
    setMessage(event.target.value);
  };

  const handleMessageSend = () => {
    if (message.trim().length > 0) {
      if (props.socketOpen) {
        props.socket.emit('sendDm', { user: props.user, recipientId: props.recipientId, msg: message.trim(), timestamp: Date.now()});
      }
      console.log('unreadMessages for sender:', unreadMessages);
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

  useEffect(() => {
    if (props.socketOpen) {
      props.socket.on('dm', (data) => {

        setMessages(prev => [...prev, data]);

        setUnreadMessages(prev => {
          console.log('prev:', prev);
          return ++prev;
        });
        console.log('unreadMessages for recipient:', unreadMessages)
        if (messagesDisplayRef.current) {
          scrollToBottom();
        }
      });

      return () => {
        props.socket.off('dm');
      }
    }
  }, [messages, props.socket, props.socketOpen, openDrawer, unreadMessages]);

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
