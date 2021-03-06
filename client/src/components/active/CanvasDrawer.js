import React, { useState, useRef, useEffect } from 'react';

import Message from '../Message';

import './CanvasDrawer.scss';

import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Slider from '@material-ui/core/Slider';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import Badge from '@material-ui/core/Badge'
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  drawerContainer: {
    backgroundColor: 'rgba(245,240,235, 0.85)'
  },
  list: {
    width: '40vw',
    minWidth: 280,
    maxWidth: 480
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

export default function CanvasDrawer(props) {
  const classes = useStyles();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const textareaRef = useRef(null);
  const messagesDisplayRef = useRef(null);

  const scrollToBottom = () => {
    messagesDisplayRef.current.scrollTo({
      top: messagesDisplayRef.current.scrollHeight,
      left: 0,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    if (props.socketOpen) {
      props.socket.on('meetingMsg', (data) => {
        setMessages(prev => [...prev, data]);
        if (openDrawer === false) {
          setUnreadMessages(prev => {
            return ++prev;
          });
        }
        if (messagesDisplayRef.current) {
          scrollToBottom();
        }
      });

      return () => {
        props.socket.off('meetingMsg');
      }
    }
  }, [messages, props.socket, props.socketOpen, openDrawer, unreadMessages]);

  const handleCaret = e => {
    var temp_value = e.target.value;
    e.target.value = '';
    e.target.value = temp_value;
  }

  const backToDash = () => {
    props.setImageLoaded(false);
    props.setInMeeting(false);
    props.setMode('DASHBOARD');
    props.setUsersInMeeting(null);
    props.socket.emit('peacingOutYo', { user: props.user, meetingId: props.meetingId });
  };

  const handleWrite = () => {
    props.setWriteMode(true);
    setOpenDrawer(false);
  };

  const handleUndo = () => {
    if (props.socketOpen) {
      props.socket.emit('undoLine', { user: props.user, meetingId: props.meetingId, page: props.page });
    }
  };

  const handleTool = (tool) => {
    props.setTool(tool);
  };

  const handleMessage = event => {
    setMessage(event.target.value);
  };

  const handleMessageSend = () => {
    if (message.trim().length > 0) {
      if (props.socketOpen) {
        props.socket.emit('msgToMeeting', { meetingId: props.meetingId, user: props.user, msg: message.trim() });
      }
      setMessage('');
    }
  };

  const handleKeyStroke = event => {
    if (event.charCode === 13) {
      event.preventDefault();
      handleMessageSend();
    }
  };

  const handleChange = (event, n) => {
    props.setStrokeWidth(n);
  };

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

  const valueText = (value) => {
    return `${value}`;
  };

  const changePage = (direction) => {
    if (direction === 'prev' && props.page !== 0) {
      props.setPage(props.page - 1);
      props.socket.emit('changePage', { meetingId: props.meetingId, user: props.user, page: props.page - 1 });
    } else if (direction === 'next' && props.page !== (props.totalPages - 1)) {
      props.setPage(props.page + 1);
      props.socket.emit('changePage', { meetingId: props.meetingId, user: props.user, page: props.page + 1 });
    }
  }

  return (
    <>
      {props.showButtons && !openDrawer && <>
        <Badge
        className='message-badge'
        color="secondary"
        badgeContent={unreadMessages}
        showZero={false}
        />
        <Button
          variant='contained'
          color='primary'
          size='small'
          className={classes.button}
          onClick={() => {
            setUnreadMessages(0);
            setOpenDrawer(true);
          }}
        >
          Tools
        </Button>
      </>}

      <Drawer
        classes={{ paper: classes.drawerContainer }}
        anchor='right'
        open={openDrawer}
        onClose={() => {
          setOpenDrawer(false);
          setUnreadMessages(0);
        }}
      >
        <div
          className={classes.list}
          role='presentation'
        >
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
          <Divider color='secondary' />
          <div id='pen-controls'>
            <Button variant='outlined' color='secondary' size='small' onClick={handleUndo}>Undo</Button>
            <div className='pens'>
              <Button
                id='penSelector'
                variant={props.tool === 'pen' ? 'contained' : 'outlined'}
                color='primary'
                size='small'
                aria-controls='simple-menu'
                aria-haspopup='true'
                onClick={() => handleTool('pen')}
              >
                Pen
            </Button>
              <Button
                id='highlighterSelector'
                variant={props.tool === 'highlighter' ? 'contained' : 'outlined'}
                color='primary'
                size='small'
                aria-controls='simple-menu2'
                aria-haspopup='true' onClick={() => handleTool('highlighter')}
              >
                Highlighter
            </Button>
              <Button
                onClick={() => handleTool('pointer')}
                variant={props.tool === 'pointer' ? 'contained' : 'outlined'}
                color='primary'
                size='small'
              >
                Pointer
            </Button>
            </div>
            <div className='pens'>
              <Typography variant='overline'>Size</Typography>
              <Slider
                defaultValue={props.strokeWidth}
                getAriaValueText={valueText}
                aria-labelledby="discrete-slider-small-steps"
                step={1}
                min={0}
                max={20}
                valueLabelDisplay="auto"
                onChange={handleChange}
              />
            </div>
          </div>
          <Divider color='secondary' />
          <div className='drawer-button-container'>
            <Button className='drawer-button' variant='outlined' color='secondary' size='small' onClick={handleWrite}>Write Notes</Button>
            <Button className='drawer-button' variant='outlined' color='secondary' size='small' onClick={backToDash}>Leave Meeting</Button>
          </div>
          {props.user.id === props.ownerId &&
            <>
              <Divider color='secondary' />
              <div id='page-navigation'>
                <Button size="small" onClick={() => changePage('prev')} disabled={props.page === 0}>
                  <KeyboardArrowLeft />
                  Back
                  </Button>
                {props.page + 1}/{props.totalPages}
                <Button size='small' onClick={() => changePage('next')} disabled={props.page === props.totalPages - 1}>
                  Next
                    <KeyboardArrowRight />
                </Button>
              </div>
              <Button
                variant='contained'
                color='secondary'
                size='small'
                className={classes.endButton}
                onClick={props.loadSpinner}
              >
                End Meeting
            </Button>
            </>
          }
        </div>
      </Drawer>
    </>
  );
}
