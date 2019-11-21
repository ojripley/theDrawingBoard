import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import FolderIcon from '@material-ui/icons/Folder';

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
});

export default function TabBar({ mode, setMode }) {
  const classes = useStyles();

  const handleChange = (event, newmode) => {
    setMode(newmode);
  };

  return (
    <BottomNavigation value={mode} onChange={handleChange} className={classes.root} showLabels>
      <BottomNavigationAction label="Contacts" value="CONTACTS" icon={<FolderIcon />} />
      <BottomNavigationAction label="Dashboard" value="DASHBOARD" icon={<FolderIcon />} />
      <BottomNavigationAction label="History" value="HISTORY" icon={<FolderIcon />} />
      <BottomNavigationAction label="Active" value="ACTIVE" icon={<FolderIcon />} />
    </BottomNavigation>
  );
}
