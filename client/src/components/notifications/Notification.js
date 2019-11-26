import Card from '@material-ui/core/Card';
import React from 'react';
import './Notifications.scss';


export default function Contact(props) {

  const dismissNotification = function() {
    console.log("DISMISS THIS");
  }


  return (<Card className='contact-card'>
    <span className='contact-username'>{props.contact.username} </span>
    <span className='contact-email'>{props.contact.email}</span>

    <Button variant="outlined" color="secondary" onClick={dismissNotification} >
      X
    </Button>
  </Card>)

}
