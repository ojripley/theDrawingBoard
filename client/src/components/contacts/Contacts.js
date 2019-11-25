import React, { useState, useEffect } from 'react';

import Contact from './Contact';
import useDebounce from "../../hooks/useDebounce";

import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
}));

export default function Contacts(props) {
  const classes = useStyles();

  const [searchTerm, setSearchTerm] = useState('');
  const [contactsList, setContactsList] = useState([]);
  const [globalSearch, setGlobalSearch] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 400);


  const handleSearchTermChange = event => {
    setSearchTerm(event.target.value);
  };

  const handleGlobalSearchChange = () => {
    if (globalSearch) {
      setGlobalSearch(false);
    } else {
      setGlobalSearch(true);
    }
  };

  useEffect(() => {
    props.socket.off('relationChanged');

    return () => {
      // setContactsList([]);
    }
  }, [globalSearch, props.socket]);

  useEffect(() => {
    console.log(debouncedSearchTerm);
    // socket check
    if (props.socketOpen) {
      if (globalSearch) {

        // emit global search
        props.socket.emit('fetchContactsGlobal', { username: debouncedSearchTerm, user: props.user });
        props.socket.on('contactsGlobal', (data) => {
          console.log('recieved all users:')
          console.log(data);
          setContactsList(data);
      });

        // close event after receiving data. Prevents multiple events
        return () => props.socket.off('contactsGlobal');
      } else {

        // emit contact search
        props.socket.emit('fetchContactsByUserId', { id: props.user.id, username: debouncedSearchTerm });
        props.socket.on('contactsByUserId', (data) => {
          console.log('recieved contacts:')
          console.log(data);
          setContactsList(data);
      });

        // close event after recieving data. Prevents multiple events
        return () => {
          props.socket.off('contactsByUserId')
        };
      }
    }
  }, [debouncedSearchTerm, globalSearch, props.socket, props.socketOpen, props.user]);


  const contacts = contactsList.map(friend => {
    if (friend.username !== props.user.username) {
      console.log(friend.username, friend.id);

      return (<Contact
        key={friend.id}
        contact={friend}
        user={props.user}
        socket={props.socket}
        socketOpen={props.socketOpen}
      />);
    }
    return null;
  });

  return (
    <>
      <h1>Contacts</h1>
      <TextField
        id="outlined-name"
        label="Contacts"
        className={classes.textField}
        value={searchTerm}
        onChange={handleSearchTermChange}
        margin="normal"
        variant="outlined"
      />
      <FormControlLabel
        control={
          <Switch
            checked={globalSearch}
            onChange={handleGlobalSearchChange}
            value="checked"
            color="primary"
          />
        }
        label={globalSearch ? 'Search: Find Friends' : 'Search: My Friends'}
      />
      <ul>
        {contacts}
      </ul>
    </>
  );
}
