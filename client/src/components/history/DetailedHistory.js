import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

export default function DetailedHistory(props) {

  console.log('props', props)

  const [notes, setNotes] = useState('');

  useEffect(() => {
    props.socket.emit('fetchNotes', {user: props.user, meetingId: props.meeting.id});
    props.socket.on('notes', res => {
      setNotes(res.notes);
    });

    return () => props.socket.off('notes');
  }, [props.socket, props.meeting.id, props.user])

  return (
    <Box>
      <h1>{props.meeting.name}</h1>
      <h3>{props.meeting.start_time}</h3>
      <h4>Hosted By</h4>
      <p>{props.meeting.owner_username}</p>
      <h4>Attendees</h4>
      <p>{props.meeting.invited_users.map((name, index) => <span key={index}>{name} </span>)}</p>
      <h4>Description</h4>
      <p>{props.meeting.description}</p>
      <h4>My Notes</h4>
      <p>{notes}</p>
      <h4>Group Notes</h4>
      <p>Pics go here</p>
      <Button variant="contained" onClick={() => props.setViewMeeting(0)}>Back</Button>
    </Box>
  );
}
