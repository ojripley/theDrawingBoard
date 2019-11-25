import React, { useState, useEffect, useRef } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FileCopyIcon from '@material-ui/icons/FileCopy';

export default function DetailedHistory(props) {

  console.log('props for details', props);

  const notesRef = useRef(null);

  const [notes, setNotes] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    props.socket.emit('fetchNotes', {user: props.user, meetingId: props.meeting.id, linkToFinalDoc: props.meeting.link_to_final_doc});
    props.socket.on('notes', res => {
      setNotes(res.usersMeetings.notes);
      setImage(res.image);
    });

    return () => props.socket.off('notes');
  }, [props.socket, props.meeting.id, props.user, props.meeting.link_to_final_doc]);

  const copyToClipboard = () => {
    console.log(notesRef.current.value)
    notesRef.current.select();
    document.execCommand('copy');
  }

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
      {notes.length > 0 && <div className='personal-notes'>
        <h4>My Notes</h4>
        <textarea className='notes-text' ref={notesRef} value={notes}>{notes}</textarea>
        <FileCopyIcon onClick={copyToClipboard} />
      </div>}
      <h4>Group Notes</h4>
      <img className='meeting-image' src={image} alt='meeting-notes' />
      <Button variant="contained" onClick={() => props.setViewMeeting(0)}>Back</Button>
    </Box>
  );
}
