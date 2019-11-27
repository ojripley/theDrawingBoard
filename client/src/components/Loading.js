import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

export default function Loading() {
  return (
    <>
      <Typography variant='h2'>Loading...</Typography>
      <CircularProgress color='secondary' />
    </>
  );
}
