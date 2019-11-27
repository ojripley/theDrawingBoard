import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

import './Loading.scss';

export default function Loading() {
  return (
    <div id='loading'>
      <Typography variant='h2'>Loading...</Typography>
      <CircularProgress color='secondary' />
    </div>
  );
}
