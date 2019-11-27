import React from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1),
  }
}));

export default function Owner(props) {

  const classes = useStyles();

  const onDestroy = () => {
    props.socket.emit('deleteMeeting', { meetingId: props.id, attendeeIds: props.attendeeIds});
  };

  return (
      !props.activeMeeting && <div id='owner-controls'>
        <Button
          variant="contained"
          color="secondary"
          className={classes.button}
          onClick={props.startMeeting}
        >
          Start Meeting
        </Button>
        <Button
          variant="contained"
          color="default"
          className={classes.button}
          onClick={onDestroy}
        >
          Cancel Meeting
        </Button>
      </div>
  );
}
