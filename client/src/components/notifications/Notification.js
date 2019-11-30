import React, { useEffect } from 'react';
import './Notification.scss';
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

  useEffect(() => { //jumps to top of page on mount
    window.scrollTo(0, 0)
  }, []);

  const dismissNotification = function(e) {
    e.stopPropagation(); //Prevents default card actions
    //Remove the element
    props.socket.emit('dismissNotification', { id: props.id }); //props.user?
    props.onRemove(props.id);
  };

  const handleClick = () => {
    if (props.type === 'contact' || props.type === 'dm') {
      props.setMode("CONTACTS");
    } else if (props.type === 'meeting') {
      props.setInitialExpandedMeeting(`panel${props.meetingId}`);
      props.setMode("DASHBOARD");
    }
  }

  // console.log(props.timestamp)
  // const timeElapsed = Math.round(Date.now() - new Date(props.timestamp) / (1000 * 60));
  // console.log('timeElapsed:', timeElapsed)

  return (
    <ListItem
      className='notification'
      onClick={handleClick}
    >
      <ListItemText
        primary={props.title}
        secondary={
          <React.Fragment>
            <Typography
              component="span"
              variant="body2"
              className={classes.inline}
              color="textPrimary"
            >
              {props.message}
            </Typography>
            <br />
            {`Received on ${new Date(props.timestamp).toLocaleString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric'
            })}`}
          </React.Fragment>
        }
      />
      <CloseIcon onClick={dismissNotification}></CloseIcon>
    </ListItem>
  )
}
