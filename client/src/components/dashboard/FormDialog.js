import React, { useState } from 'react';
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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    props.socket.emit('insertMeeting', {
      startTime: selectedDate,
      ownerId: props.user.id,
      name: meetingName,
      description: meetingDesc,
      status: 'scheduled',
      linkToInitialDoc: null
    })
    props.socket.on('newMeeting', res => {
      for (let contact of selectedContacts) {
        props.socket.emit('insertUsersMeeting', { userId: contact.id, meetingId: res[0].id})
      }
    })
  }

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Create New Meeting
      </Button>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">New Meeting</DialogTitle>
        <DialogContent>
          <Form
            socket={props.socket}
            socketOpen={props.socketOpen}
            user={props.user.id}
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
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleSubmit();
              handleClose();
            }}
            color="primary"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
