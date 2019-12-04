import React, { useEffect } from 'react';

import { makeStyles } from '@material-ui/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles(theme => ({
  inline: {
    display: 'inline',
  },
}));

export default function Contact(props) {

  const classes = useStyles();

  const time = new Date(props.timestamp).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });

  useEffect(() => { //jumps to top of page on mount
    window.scrollTo(0, 0)
  }, []);

  // Removes individual notifications
  const dismissNotification = function(e) {
    e.stopPropagation(); //Prevents default card actions
    props.socket.emit('dismissNotification', { id: props.id });
    props.onRemove(props.id);
  };

  // Redirect users on click to the corresponding tab
  const handleClick = () => {
    if (props.type === 'contact' || props.type === 'dm') {
      props.setMode("CONTACTS");
    } else if (props.type === 'meeting') {
      props.setInitialExpandedMeeting(`panel${props.meetingId}`);
      props.setMode("DASHBOARD");
    }
  };

  return (
    <ListItem
      className='notification'
      onClick={handleClick}
    >
      <ListItemText
        primary={props.title}
        secondary={
          <>
            <Typography
              variant="body2"
              className={classes.inline}
              color="textPrimary"
            >
              {props.message}
            </Typography>
            <br />
            Received on {time}
          </>
        }
      />
      <CloseIcon onClick={dismissNotification}></CloseIcon>
    </ListItem>
  )
}
