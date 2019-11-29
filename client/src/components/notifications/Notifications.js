import React, { useState } from 'react';

import Notification from './Notification';
import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Collapse from '@material-ui/core/Collapse';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

// const useStyles = makeStyles(theme => ({
  // list: {
  //   width: '100%'
  // },
  // section: {
  //   margin: theme.spacing(1)
  // },
  // heading: {
  //   fontSize: theme.typography.pxToRem(15),
  //   flexBasis: '33.33%',
  //   flexShrink: 0,
  // },
  // secondaryHeading: {
  //   fontSize: theme.typography.pxToRem(15),
  //   color: theme.palette.text.secondary,
  // },
  // active: {
  //   backgroundColor: 'orange'
  // },
  // scheduled: {
  //   backgroundColor: 'white'
  // },
  // button: {
  //   display: 'inline',
  //   float: 'right',
  //   margin: theme.spacing(1),
  // },
  // header2: {
  //   fontSize: '1.5em',
  //   fontWeight: 'bold'
  // }
  // panel: {
  //   margin: 0,
  //   '&expanded' : {
  //     margin: 0
  //   }
  // }
// }));

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  }
}));

export default function Notifications(props) {

  const classes = useStyles();
  const [meetingExpanded, setMeetingExpanded] = useState(true);
  const [contactsExpanded, setContactsExpanded] = useState(true);

  const removeNotification = (id) => {
    console.log(id);
    const newNotifications = props.notificationList.filter(notif => notif.id !== id);
    props.setNotificationList(newNotifications);
  }

  const removeAllNotifications = () => {
    console.log('Sending Owen this:', props.user.id);
    props.socket.emit('dismissAllNotifications', { userId: props.user.id });
    props.setNotificationList([]);
  }

  const removeNotificationsByType = (type) => {
    props.socket.emit('dismissNotificationType', { userId: props.user.id, type: type });
    props.setNotificationList(prev => prev.filter(notification => notification.type !== type));
  }


  const meetings = props.notificationList
    .filter(notification => notification.type === "meeting")
    .map(notif => {
      return (<Notification
        key={notif.id}
        id={notif.id}
        user={props.user}
        userId={notif.userId}
        type={notif.type}
        title={notif.title}
        message={notif.msg}
        onClick={() => {
          props.setInitialExpandedMeeting(`panel${notif.meetingId}`);
          props.setMode("DASHBOARD");
        }}
        onRemove={removeNotification}
        timestamp={notif.time}
        setMode={props.setMode}
        socket={props.socket}
        socketOpen={props.socketOpen}
      />);
    });


  const contacts = props.notificationList
    .filter(notification => notification.type === "contact" || notification.type === "dm")
    .map(notif => {
      return (<Notification
        key={notif.id}
        id={notif.id}
        user={props.user}
        userId={props.userId}
        type={notif.type}
        title={notif.title}
        message={notif.msg}
        onClick={() => props.setMode("CONTACTS")}
        onRemove={removeNotification}
        timestamp={notif.time}
        setMode={props.setMode}
        socket={props.socket}
        socketOpen={props.socketOpen}
      />);
    });

  return (
    <>
      <div id='page-header'>
        <div className='notifications-header'>
          <Typography variant='h2' color='primary'>Notifications</Typography>
          <Button variant="outlined" color="secondary" size='small' onClick={removeAllNotifications}> Dismiss all</Button>
        </div>
        <Divider />
      </div>
      <div id='notifications-container'>
        {props.notificationList.length === 0 && <Typography variant='h6'>No new notifications!</Typography>}

        {meetings.length > 0 &&
          <List
            aria-labelledby="meetings-notifications"
            className={classes.root}
          >
            <ListItem onClick={() => setMeetingExpanded(!meetingExpanded)}>
              <Typography variant='button'>Meeting Notifications</Typography>
              {meetingExpanded ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={meetingExpanded} timeout="auto" unmountOnExit>
              <List disablePadding>
                <ListItem className={classes.nested}>
                  {meetings}
                </ListItem>
              </List>
            </Collapse>
          </List>
        }

        {contacts.length > 0 &&
          <List
            aria-labelledby="contacts-notifications"
            className={classes.root}
          >
            <ListItem onClick={() => setContactsExpanded(!contactsExpanded)}>
              <Typography variant='button'>Contacts Notifications</Typography>
              {meetingExpanded ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={contactsExpanded} timeout="auto" unmountOnExit>
              <List disablePadding>
                <ListItem className={classes.nested}>
                  {contacts}
                </ListItem>
              </List>
            </Collapse>
          </List>
        }
      </div>

    </>
  );
}


// {meetings.length > 0 &&
//   <ExpansionPanel expanded={meetingExpanded} onChange={() => setMeetingExpanded(!meetingExpanded)} classes={{ root: classes.panel }} >
//     <ExpansionPanelSummary
//       aria-controls={`panel1bh-content`}
//       id={`panel1bh-header`}
//     >
//       <Typography variant='button'>{`Meeting Notifications (${meetings.length})`}</Typography>
//       <Button className='dismiss-all' variant="outlined" color="secondary" size='small' onClick={() => removeMeetingNotifications("meeting")}>Dismiss</Button>

//     </ExpansionPanelSummary>
//     <ExpansionPanelDetails>
//       <ul className={classes.list}>
//         {meetings}
//       </ul>
//     </ExpansionPanelDetails>
//   </ExpansionPanel>

// }

// {contacts.length > 0 &&
//   <ExpansionPanel expanded={contactsExpanded} onChange={() => setContactsExpanded(!contactsExpanded)}>
//     <ExpansionPanelSummary
//       aria-controls={`panel1bh-content`}
//       id={`panel1bh-header`}
//     >
//       <Typography variant='button'>{`Contact Notifications (${contacts.length})`}</Typography>
//       <Button variant="outlined" color="secondary" size='small' onClick={() => removeMeetingNotifications("contact")}>Dismiss</Button>
//     </ExpansionPanelSummary>
//     <ExpansionPanelDetails>
//       <ul className={classes.list}>
//         {contacts}
//       </ul>
//     </ExpansionPanelDetails>
//   </ExpansionPanel>

// }
