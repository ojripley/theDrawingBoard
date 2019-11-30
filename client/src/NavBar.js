import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';

import './NavBar.scss';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
  },
  button: {
    padding: 0,
    color: '#fff'
  },
  title: {
    flexGrow: 1,
    fontFamily: "'Molle', cursive",
    fontSize: '1.25rem'
  },
  username: {
    marginRight: '0.5em'
  },
  fullList: {
    width: 'auto',
    height: '100vh',
    backgroundColor: theme.palette.primary.light,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
}));

export default function NavBar(props) {
  const classes = useStyles();

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    document.cookie = 'sid=""'; //clear the cookie
    props.setUser(null);
    props.setLoading(false);
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography className={classes.title} onClick={() => props.setMode('DASHBOARD')}>
          The Drawing Board
        </Typography>
        {props.user &&
          <>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={() => setOpen(!open)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="top" open={open} onClose={() => setOpen(!open)}>
              <div
                className={classes.fullList}
                role="presentation"
                onClick={() => setOpen(!open)}
              >
                <Typography classes={{ root: classes.button }} variant='h2'>Logged in as: {props.user.username}</Typography>
                <Button
                  color="inherit"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  size='large'
                  onClick={handleLogout}
                  classes={{ root: classes.button }}
                  >
                  Logout
                </Button>
              </div>
            </Drawer>
          </>
        }
      </Toolbar>
    </AppBar>
  );
}
