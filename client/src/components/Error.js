import React from 'react';
import Typography from '@material-ui/core/Typography';
import geraldTheHerald from '../images/GERALDTHEHERALD.png';

import './Error.scss';

export default function Error(props) {

  return (
    <div id='error-container'>
      <div id='error'>
        <div id='error-msg'>
          <Typography variant='h6' id='gerald'>
            {'Gerald the Error Herald says:'}
          </Typography>
          <Typography variant='h2' id='title'>
            {'Oops, ya broke it! :('}
          </Typography>
          <Typography variant='body1' id='msg'>
            {props.error.msg}
          </Typography>
        </div>
        <img src={geraldTheHerald} alt='Gerald the Error Herald'></img>
      </div>
    </div>
  );
}
