import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  button: {
    zIndex: 999,
    position: 'fixed',
    bottom: 0,
    right: 0
  }
});

export default function CanvasDrawer(props) {
  const classes = useStyles();
  const [openDrawer, setOpenDrawer] = useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // const toggleDrawer = (open) => event => {
  //   if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
  //     return;
  //   }

  //   setOpenDrawer(false);
  // };

  const backToDash = () => {
    props.setInMeeting(false);
    props.setMode('DASHBOARD');
  }

  const handleWrite = () => {
    props.setWriteMode(prev => !prev);
    setOpenDrawer(false);
  }

  return (
    <div>
      <Button variant='contained' color='primary' className={classes.button} onClick={() => setOpenDrawer(true)}>Open Tools</Button>
      <Drawer anchor="right" open={openDrawer} onClose={() => setOpenDrawer(false)}>
        <div
          className={classes.list}
          role="presentation"
        >
          <List>
            <ListItem button>Undo</ListItem>
            <ListItem button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>Pen</ListItem>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Small</MenuItem>
              <MenuItem onClick={handleClose}>Medium</MenuItem>
              <MenuItem onClick={handleClose}>Large</MenuItem>
            </Menu>
            <ListItem button>Highlighter</ListItem>
            <ListItem button>Pointer</ListItem>
          </List>
          <Divider />
          <List>
            <ListItem button onClick={handleWrite}>Write Notes</ListItem>
          </List>
          <Divider />
          <List>
            <ListItem button onClick={backToDash}>Back to Dashboard</ListItem>
          </List>
        </div>
      </Drawer>
    </div>
  );
}
