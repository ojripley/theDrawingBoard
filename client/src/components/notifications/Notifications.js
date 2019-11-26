import React, { useState, useEffect } from 'react';

import Notification from './Notification';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  }
}));

export default function Notifications(props) {

  const notifications = props.notificationsList
    .filter(notification => notification.type === "meeting")
    .map(notif => {
      <Notification
        type={notif.type}
        message={notif.message}
        timestamp={notif.timestamp}
        socket={props.socket}
        socketOpen={props.socketOpen}
      />
    });

  return (
    <>
      <h1>Notifications</h1>
      <ul>
        {notifications}
      </ul>
    </>
  );
}
