import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
  },
  button: {
    padding: 0,
  },
  title: {
    flexGrow: 1,
    fontFamily: "'Molle', cursive"
  },
  username: {
    marginRight: '0.5em'
  }
}));

export default function NavBar(props) {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleLogout = () => {
    document.cookie = 'sid=""'; //clear the cookie
    props.setUser(null);
    props.setLoading(false);
  };


  const handleMenu = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
          <MenuIcon />
        </IconButton> */}
        <Typography variant="h6" className={classes.title} onClick={() => props.setMode('DASHBOARD')}>
          The Drawing Board
        </Typography>
        {props.user && (
          <>
            <Button
              color="inherit"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleLogout}
              classes={{ root: classes.button }}
            >
              Logout
            </Button>
        </>
        )}
      </Toolbar>
    </AppBar>
  );
}
