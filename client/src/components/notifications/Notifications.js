import React from 'react';

import Notification from './Notification';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  section: {
    margin: theme.spacing(1)
  }
}));

export default function Notifications(props) {


  const classes = useStyles();


  const removeNotification = (id) => {
    console.log(id);
    const newNotifications = props.notificationList.filter(notif => notif.id !== id);
    props.setNotificationList(newNotifications);
  }


  const notifications = props.notificationList
    .filter(notification => notification.type === "meeting")
    .map(notif => {
      return (<Notification
        key={notif.id}
        id={notif.id}
        user={props.user}
        type={notif.type}
        title={notif.title}
        onClick={() => props.setMode("DASHBOARD")}
        onRemove={removeNotification}
        message={notif.message}
        timestamp={notif.timestamp}
        setMode={props.setMode}
        socket={props.socket}
        socketOpen={props.socketOpen}
      />);
    });


  const contacts = props.notificationList
    .filter(notification => notification.type === "contacts")
    .map(notif => {
      return (<Notification
        key={notif.id}
        id={notif.id}
        user={props.user}
        type={notif.type}
        title={notif.title}
        onClick={() => props.setMode("CONTACTS")}
        onRemove={removeNotification}
        message={notif.message}
        timestamp={notif.timestamp}
        setMode={props.setMode}
        socket={props.socket}
        socketOpen={props.socketOpen}
      />);
    });

  const dms = props.notificationList
    .filter(notification => notification.type === "dm")
    .map(notif => {
      return (<Notification
        key={notif.id}
        id={notif.id}
        user={props.user}
        type={notif.type}
        title={notif.title}
        onClick={() => props.setMode("DASHBOARD")}
        onRemove={removeNotification}
        message={notif.message}
        timestamp={notif.timestamp}
        setMode={props.setMode}
        socket={props.socket}
        socketOpen={props.socketOpen}
      />);
    });



  console.log(notifications);

  return (
    <>
      <h1>Notifications</h1>

      <h2 class={classes.section}> Meetings </h2>
      <ul>
        {notifications}
      </ul>

      <h2 class={classes.section}> Contacts </h2>
      <ul>
        {contacts}
      </ul>

      <h2 class={classes.section}> Direct Messages </h2>
      <ul>
        {dms}
      </ul>


    </>
  );
}
