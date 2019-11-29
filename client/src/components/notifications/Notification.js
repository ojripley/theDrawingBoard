import React from 'react';
import './Notification.scss';
import { makeStyles } from '@material-ui/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles(theme => ({
  inline: {
    display: 'inline',
  },
}));

export default function Contact(props) {

  const classes = useStyles();

  const dismissNotification = function(e) {
    e.stopPropagation(); //Prevents default card actions
    //Remove the element
    props.socket.emit('dismissNotification', { id: props.id }); //props.user?
    props.onRemove(props.id);
  }

  console.log(props.timestamp)
  const timeElapsed = Math.round(Date.now() - new Date(props.timestamp) / (1000 * 60));
  console.log('timeElapsed:', timeElapsed)


  return (
    <>
      <ListItem className='notification'>
        <ListItemText
          primary={props.title}
          secondary={
            <React.Fragment>
              <Typography
                component="span"
                variant="body2"
                className={classes.inline}
                color="textPrimary"
              >
                {props.message}
              </Typography>
              <br/>
              {`Received on ${new Date(props.timestamp).toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
              })}`}
            </React.Fragment>
          }
        />
        <CloseIcon onClick={dismissNotification}></CloseIcon>
      </ListItem>
    </>
  )

}

{/* <Card className='card' onClick={props.onClick}>
<h1 className='title'>{props.title}
  <Button variant="outlined" color="secondary" onClick={(e) => dismissNotification(e)} >
    X
</Button>
</h1>
<p className='message'>{props.message}</p>
<footer className='timestamp'>{props.timestamp}</footer>
</Card > */}
