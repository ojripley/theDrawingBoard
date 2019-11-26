import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import DashboardIcon from '@material-ui/icons/Dashboard';
import NotificationsIcon from '@material-ui/icons/Notifications';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import HistoryIcon from '@material-ui/icons/History';
import Badge from '@material-ui/core/Badge';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
    backgroundColor: theme.palette.tertiary.main
  },
  padding: {
    padding: theme.spacing(0, 1.1),
  },
}));

export default function TabBar({ mode, setMode, notificationList }) {
  const classes = useStyles();

  const handleChange = (event, newmode) => {
    setMode(newmode);
  };

  return (
    <BottomNavigation value={mode} onChange={handleChange} className={classes.root} showLabels>
      <BottomNavigationAction label="Contacts" value="CONTACTS" icon={<AccountCircleIcon />} />
      <BottomNavigationAction label="Dashboard" value="DASHBOARD" icon={<DashboardIcon />} />
      <BottomNavigationAction label="History" value="HISTORY" icon={<HistoryIcon />} />
      <BottomNavigationAction label={
        <Badge className={classes.padding} color="primary" badgeContent={notificationList.length}>Notifications</Badge>
      } value="NOTIFICATIONS" icon={<NotificationsIcon />} />
    </BottomNavigation>
  );
}
