import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import HistoryCard from './HistoryCard';
import DetailedHistory from './DetailedHistory';

import './History.scss';

export default function History(props) {

  const currentUser = props.user;

  const [meetings, setMeetings] = useState([]);
  const [viewMeeting, setViewMeeting] = useState(0);

  useEffect(() => {
    if (props.socketOpen) {
      props.socket.emit('fetchMeetings', {username: currentUser.username, meetingStatus: 'past'});
      props.socket.on('meetings', data => {
        console.log(data);
        setMeetings(data)
      });

      return () => {
        props.socket.off('meetings');
      };
    }
  }, [props.socket, props.socketOpen, currentUser.username]);

  const displayDetailedHistory = (id) => {
    console.log('id', id)
    setViewMeeting(id);
  }

  const historyList = meetings.map(meeting => {
    console.log('meeting', meeting)
    return (
      <li className='history-list-item' key={meeting.id}>
        <HistoryCard
          id={meeting.id}
          name={meeting.name}
          date={meeting.start_time}
          displayDetailedHistory={displayDetailedHistory}
        />
      </li>
    )
  });

  return (
    <Box>
      {viewMeeting === 0 ? (
        <>
          <h1>History</h1>
          <ul className='history-list'>
            {historyList}
          </ul>
        </>
      ) : <DetailedHistory
        meeting={meetings.filter(meeting => meeting.id === viewMeeting)[0]}
        setViewMeeting={setViewMeeting}
        user={props.user}
        socket={props.socket}
      />
    }
    </Box>

  );
}
