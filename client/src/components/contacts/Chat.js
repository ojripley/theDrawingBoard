import React, { useEffect, useState, useRef } from 'react';
import './Chat.scss';
import Message from '../Message';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';


const useStyles = makeStyles(theme => ({
  drawerContainer: {
    backgroundColor: 'rgba(245,240,235, 0.85)'
  },
  list: {
    width: '40vw',
    minWidth: 280,
  },
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
  const classes = useStyles();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const textareaRef = useRef(null);
  const messagesDisplayRef = useRef(null);

  const scrollToBottom = () => {
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
        props.socket.emit('sendDm', { user: props.user, recipientId: props.recipient.id, msg: message.trim(), time: new Date(Date.now()) });
      }
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
      props.socket.emit('fetchDms', { user: props.user, recipientId: props.recipient.id });

      props.socket.on('DmsFetched', (data) => {
        const msgs = [];

        for (let message of data) {
          const msg = {};
          msg.msg = message.msg;
          msg.time = message.time;

          if (message.user_id === props.user.id) {

            msg.sender = props.recipient;
            msg.user = props.user;
          } else {

            msg.sender = props.user;
            msg.user = props.recipient;
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

        if (messagesDisplayRef.current) {
          scrollToBottom();
        }
      });

      return () => {
        props.socket.off('dm');
      }
    }
  }, [messages, props.socket, props.socketOpen]);


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
    <>
      <div id='page-header'>
        <div className='notifications-header'>
          <Typography variant='h2' color='primary'>{props.recipient.username}</Typography>
          <Button className='back-to-history' variant="outlined" color='secondary' size='small' onClick={() => props.setViewChat(0)}>Back</Button>
        </div>
        <Divider />
      </div>
      <List id='dm-chat-container'>
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
    </>
  )
}
