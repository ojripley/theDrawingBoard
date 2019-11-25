import React, { useEffect } from 'react';
// import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1),
  }
}));

export default function Owner(props) {

  const classes = useStyles();

  // useEffect(() => {
  //   props.socket.on('meetingDeleted', () => {
  //     console.log('meeting deleted');
  //   })
  // })

  const onDestroy = () => {
    props.socket.emit('deleteMeeting', { meetingId: props.id, attendeeIds: props.attendeeIds});
  };

  // const onEdit = () => {
  //   console.log('edit')
  // };

  // const startMeeting = () => {
  //   props.socket.emit('startMeeting', {id: props.id});
  // };

  return (
    <div className='owner-controls'>
      {!props.activeMeeting && <Button
        variant="contained"
        color="secondary"
        className={classes.button}
        onClick={props.startMeeting}
      >
        Start Meeting
      </Button>}
      <DeleteIcon onClick={onDestroy}/>
    </div>
  );
}
