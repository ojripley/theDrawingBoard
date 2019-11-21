import React, { useState, useEffect } from 'react';

import './Dashboard.scss';

import MeetingCard from './MeetingCard';
import FormDialog from './FormDialog';


export default function Dashboard(props) {

  const currentUser = props.user;

  const [meetings, setMeetings] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const handleMeetings = () => {
    props.socket.emit('fetchMeetings', {username: currentUser.username, meetingStatus: 'scheduled'});
    props.socket.on('meetings', data => {
      console.log('handling')
      setMeetings(data)
    });
  };

  useEffect(() => {
    if (props.socketOpen) {
      handleMeetings();
      return () => props.socket.off('meetings');
    }
  }, []);

  useEffect(() => {
    props.socket.on('invitedUsers', () => {
      handleMeetings();
    });
    return () => props.socket.off('invitedUsers');
  }, [])


  const list = meetings.map(meeting => {

    return (
      <li className='meeting-list-item' key={meeting.id}>
        <MeetingCard
          id={meeting.id}
          startTime={meeting.start_time}
          name={meeting.name}
          owner={meeting.owner_username}
          attendees={meeting.invited_users}
          description={meeting.description}
          user={currentUser.username}
          expanded={expanded}
          setExpanded={setExpanded}
        />
      </li>
    )
  });

  return (
    <div>
      <h1>Upcoming Meetings</h1>
      <FormDialog
        socket={props.socket}
        socketOpen={props.socketOpen}
        user={currentUser}
      />
      <ul className='meeting-list'>
        {list}
      </ul>
    </div>
  );
}
