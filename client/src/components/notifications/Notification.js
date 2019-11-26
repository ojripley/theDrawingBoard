import Card from '@material-ui/core/Card';
import React from 'react';
import './Notification.scss';
import Button from '@material-ui/core/Button';


export default function Contact(props) {

  const dismissNotification = function(e) {
    console.log("DISMISS THIS");
    e.stopPropagation(); //Prevents default card actions
    //Remove the element
    props.socket.emit('dismissNotification', props.id);
    props.onRemove(props.id);
  }


  return (<Card className='card' onClick={props.onClick}>
    <h1 className='title'>{props.title}
      <Button variant="outlined" color="secondary" onClick={(e) => dismissNotification(e)} >
        X
    </Button>
    </h1>
    <p className='message'>{props.message}</p>
    <footer className='timestamp'>{props.timestamp}</footer>

  </Card >)

}
