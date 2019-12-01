import React from 'react';
import Typography from '@material-ui/core/Typography';

import './Error.scss';

export default function Error(props) {

  return (
    <div id="error">
      <Typography variant="h2" id="title">
        {'Oops, ya broke it! :('}
      </Typography>
      <Typography variant="body1" id="msg">
        {props.error.msg}
      </Typography>
    </div>
  );
}
