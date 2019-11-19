import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import FolderIcon from '@material-ui/icons/Folder';

const useStyles = makeStyles({
  root: {
    width: 500,
  },
});

export default function SimpleBottomNavigation() {
  const classes = useStyles();
  const [value, setValue] = React.useState('contacts');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <BottomNavigation value={value} onChange={handleChange} className={classes.root} showLabels>
      <BottomNavigationAction label="Contacts" value="contacts" icon={<FolderIcon />} />
      <BottomNavigationAction label="Dashboard" value="dashboard" icon={<FolderIcon />} />
      <BottomNavigationAction label="History" value="history" icon={<FolderIcon />} />
      <BottomNavigationAction label="Active" value="active" icon={<FolderIcon />} />
    </BottomNavigation>
  );
}
