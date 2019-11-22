import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import Form from './Form';

export default function FormDialog(props) {
  const [open, setOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [meetingName, setMeetingName] = useState('');
  const [meetingDesc, setMeetingDesc] = useState('');

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };

  // const handleClose = () => {
  //   setOpen(false);
  // };

  useEffect(() => {
    if (props.socketOpen) {
      props.socket.on('newMeeting', res => {
        props.socket.emit('insertUsersMeeting', { userId: props.user.id, meetingId: res.id})
        for (let contact of selectedContacts) {
          props.socket.emit('insertUsersMeeting', { userId: contact.id, meetingId: res.id})
        }
        setSelectedContacts([]);
      });
      return () => {
        props.socket.off('newMeeting');
      };
    }
  }, [props.socketOpen, props.socket, props.user.id, selectedContacts, setSelectedContacts]);

  const handleSubmit = () => {
    props.socket.emit('insertMeeting', {
      startTime: selectedDate,
      ownerId: props.user.id,
      name: meetingName,
      description: meetingDesc,
      status: 'scheduled',
      linkToInitialDoc: null
    });

    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={() => setOpen(true)}>
        Create New Meeting
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">New Meeting</DialogTitle>
        <DialogContent>
          <Form
            socket={props.socket}
            socketOpen={props.socketOpen}
            user={props.user}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedContacts={selectedContacts}
            setSelectedContacts={setSelectedContacts}
            meetingName={meetingName}
            setMeetingName={setMeetingName}
            meetingDesc={meetingDesc}
            setMeetingDesc={setMeetingDesc}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
