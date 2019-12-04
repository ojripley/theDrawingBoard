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
  const [files, setFiles] = useState({});

  const handleClose = () => {
    setOpen(false);
    setSelectedContacts([]);
    setSelectedDate(new Date());
  };

  useEffect(() => {
    if (props.socketOpen) {
      props.socket.on('newMeeting', res => {
        setSelectedContacts([]);
      });
      return () => {
        props.socket.off('newMeeting');
      };
    }
  }, [props.socketOpen, props.socket, setSelectedContacts]);

  const handleSubmit = () => {

    let filesObject = {};

    for (let i = 0; i < files.length; i++) {
      let theFile = files.item(i);
      filesObject[theFile.name] = theFile;
    }

    props.socket.emit('insertMeeting', {
      startTime: selectedDate,
      ownerId: props.user.id,
      name: meetingName,
      description: meetingDesc,
      status: 'scheduled',
      selectedContacts: [...selectedContacts, props.user],
      files: filesObject
    });

    setOpen(false);
  };

  return (
    <>
      <Button variant="outlined" color="secondary" onClick={() => setOpen(true)}>
        Create New Meeting
      </Button>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
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
            setFiles={setFiles}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
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
    </>
  );
}
