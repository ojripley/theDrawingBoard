import React from 'react';
import Typography from '@material-ui/core/Typography';

export default function Message(props) {
  // console.log('props.user:', props.user)
  // console.log('props.sender:', props.sender)

  const time = new Date(props.time).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric' });

  return (
    <div className={props.sender.id === props.user.id ? 'sender' : 'recipient'}>
      <Typography className='message-container' variant='body2'>{props.msg}</Typography>
      <Typography variant='subtitle2'>{props.sender.username}</Typography>
    </div>
  );
}
