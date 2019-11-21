import React, { useState, useEffect } from 'react';

import './Dashboard.scss';

import MeetingCard from './MeetingCard';
import FormDialog from './FormDialog';

const currentUser = {
  id: 1,
  username: 'oj',
  email: 'oj@mail.com'
}

export default function Dashboard(props) {

  const [meetings, setMeetings] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (props.socketOpen) {
      props.socket.emit('fetchMeetings', {id: currentUser.username, meetingStatus: 'past'});
      props.socket.on('meetings', data => {
        setMeetings(data)
      });
      return () => props.socket.off('meetings');
    }
  }, [props.socket, props.socketOpen]);


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
