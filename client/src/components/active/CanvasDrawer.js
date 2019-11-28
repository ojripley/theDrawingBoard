import React, { useState, useRef, useEffect } from 'react';

import Message from './Message';

import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Slider from '@material-ui/core/Slider';


import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  center: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
    width: '100%',
  },
  textareaAutosize: {
    resize: 'none',
    width: '80%',
    marginRight: '1em'
  },
  button: {
    zIndex: 999,
    position: 'fixed',
    bottom: 0,
    right: 0
  },
  sendButton: {
    position: 'relative',
  },
});

export default function CanvasDrawer(props) {
  const classes = useStyles();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const textareaRef = useRef(null);

  useEffect(() => {
    if (props.socketOpen) {
      props.socket.on('meetingMsg', (data) => {
        setMessages(prev => [data, ...prev]);
      });
    }
    return () => {
      props.socket.off('meetingMsg');
    }
  }, [messages, props.socket, props.socketOpen]);

  useEffect(() => {

  }, [message])

  const handleCaret = e => {
    var temp_value = e.target.value;
    e.target.value = '';
    e.target.value = temp_value;
  }

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const backToDash = () => {
    props.setImageLoaded(false);
    props.setInMeeting(false);
    props.setMode('DASHBOARD');
  };

  const handleWrite = () => {
    props.setWriteMode(prev => !prev);
    setOpenDrawer(false);
  };

  const handleUndo = () => {
    if (props.socketOpen) {
      props.socket.emit('undoLine', { user: props.user, meetingId: props.meetingId });
    }
  }


  const handleTool = (tool) => {
    props.setTool(tool);
    handleClose();
    setOpenDrawer(false);
  }

  const handleMessage = event => {
    setMessage(event.target.value);
    console.log(message);
  };

  const handleMessageSend = () => {
    if (message.length > 0) {
      if (props.socketOpen) {
        props.socket.emit('msgToMeeting', { meetingId: props.meetingId, user: props.user, msg: message });
      }
      setMessage('');
    }
  }

  const handleKeyStroke = event => {
    if (event.charCode === 13) {
      handleMessageSend();
    }
  }

  const handleChange = (event, n) => {
    props.setStrokeWidth(n);
  };

  const msgs = messages.map((message) => {
    return (
      <Message
        key={message.time}
        user={message.user}
        msg={message.msg}
        time={message.time}
      />
    )
  });

  const valueText = (value) => {
    return `${value}`;
  }

  return (
    <>
      <Button variant='contained' color='primary' className={classes.button} onClick={() => setOpenDrawer(true)}>Open Tools</Button>
      <Drawer anchor='right' open={openDrawer} onClose={() => setOpenDrawer(false)}>
        <div
          className={classes.list}
          role='presentation'
        >
          <List>
            <ListItem className={`meeting-chat ${classes.center}`}>
              <section className='messages-display'>{msgs}</section>
              <TextareaAutosize
                ref={textareaRef}
                aria-label='empty textarea'
                placeholder='Remember: kids who type curse words lose fingers!'
                value={message}
                className={classes.textareaAutosize}
                onFocus={handleCaret}
                onChange={handleMessage}
                onKeyPress={handleKeyStroke}
              />
              <Button variant='contained' color='primary' className={classes.sendButton} onClick={handleMessageSend}>Send</Button>
            </ListItem>
          </List>
          <List>
            <ListItem button onClick={handleUndo}>Undo</ListItem>
            <ListItem id='penSelector' button aria-controls='simple-menu' aria-haspopup='true' onClick={() => handleTool('pen')}>Pen</ListItem>

            {/* <ListItem button onClick={() => props.setHighlighting(true)}>Highlighter</ListItem> */}
            <ListItem id='highlighterSelector' button aria-controls='simple-menu2' aria-haspopup='true' onClick={() => handleTool('highlighter')}>Highlighter</ListItem>

            <ListItem onClick={() => handleTool('pointer')} button>Pointer</ListItem>
            <ListItem>
              Size
              <Slider
                defaultValue={props.strokeWidth}
                getAriaValueText={valueText}
                aria-labelledby="discrete-slider-small-steps"
                step={1}
                marks
                min={0}
                max={20}
                valueLabelDisplay="auto"
                onChange={handleChange}
              />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem button onClick={handleWrite}>Notes</ListItem>
          </List>
          <Divider />
          <List>
            <ListItem button onClick={backToDash}>Leave Meeting</ListItem>
          </List>
        </div>
      </Drawer>
    </>
  );
}
