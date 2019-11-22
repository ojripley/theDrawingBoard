import React, { useState } from 'react';
import Box from '@material-ui/core/Box';

export default function History(props) {

  const [viewMeeting, setViewMeeting] = useState('all');

  const meetingList;

  return (
    <Box>
      <h1>History</h1>
      {viewMeeting === 'all' && meetingList}
    </Box>

  );
}
