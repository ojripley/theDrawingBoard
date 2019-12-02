import React, { useEffect, useState, useRef }from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

import Message from '../Message';

const useStyles = makeStyles(theme => ({
  drawerContainer: {
    backgroundColor: 'rgba(245,240,235, 0.85)'
    // backgroundColor: theme.palette.primary.light
  },
  list: {
    width: '40vw',
    minWidth: 280,
  },
  // center: {
  //   display: 'flex',
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   position: 'relative',
  //   zIndex: 2,
  //   width: '100%',
  // },
  textareaAutosize: {
    resize: 'none',
    width: '85%',
    marginRight: 0,
    borderRadius: '15px 15px',
    border: 'none',
    padding: '0.5em 0.75em 0'
  },
  button: {
    zIndex: 999,
    position: 'fixed',
    top: 10,
    right: 10
  },
  endButton: {
    position: 'relative',
    float: 'right',
    margin: '0.5em 10px'
  },
  sendButton: {
    position: 'relative',
    padding: 0
  },
}));

export default function Chat(props) {
  console.log('props', props);
  const classes = useStyles();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const textareaRef = useRef(null);
  const messagesDisplayRef = useRef(null);

  const scrollToBottom = () => {
    // messagesDisplayRef.current.scrollTop = messagesDisplayRef.current.scrollHeight;
    messagesDisplayRef.current.scrollTo({
      top: messagesDisplayRef.current.scrollHeight,
      left: 0,
      behavior: 'smooth'
    })
  }

  const handleMessage = event => {
    setMessage(event.target.value);
  };

  const handleMessageSend = () => {
    if (message.trim().length > 0) {
      if (props.socketOpen) {
        console.log('props', props);
        props.socket.emit('sendDm', { user: props.user, recipientId: props.recipient.id, msg: message.trim(), time: new Date(Date.now())});
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
      props.socket.emit('fetchDms', {user: props.user, recipientId: props.recipient.id});

      props.socket.on('DmsFetched', (data) => {
        const msgs = [];

        // goog luck figuring this one out
        for (let message of data) {
          const msg = {};
          msg.msg = message.msg;
          msg.time = message.time;
          if (message.user_id === props.user.id) {
            msg.sender = props.user;
            msg.user = props.recipient;
          } else {
            msg.sender = props.recipient;
            msg.user = props.user;
          }
          msgs.push(msg);
        }
        setMessages(msgs);
      });
    }
  }, []);

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
  }, [messages, props.socket, props.socketOpen, unreadMessages]);


  const msgs = messages.map((message) => {
    return (
      <Message
        key={message.time}
        sender={message.user}
        user={props.user}
        msg={message.msg}
        time={message.time}
      />
    )
  });


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
