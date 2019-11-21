import React, { useState, useEffect } from 'react';

import Contact from './Contact';

import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';



// boiled data
// will be replaced with an axios call


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

  const handleSearchTermChange = event => {
    console.log('event target value:', event.target.value);
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
    if (props.socketOpen) {
      if (globalSearch) {
        props.socket.emit('fetchContactsGlobal', { username: searchTerm });
      } else {
        props.socket.emit('fetchContactsByUserId', { id: 1, username: searchTerm});
      }
    }
  }, [searchTerm, globalSearch]);

  useEffect(() => {
    props.socket.on('contactsByUserId', (data) => {
      console.log(data);
      setContactsList(data);
    });
  }, []);

  useEffect(() => {
    props.socket.on('contactsGlobal', (data) => {
      console.log(data);
      setContactsList(data);
    });
  }, []);

  const contacts = contactsList.map(friend =>
    (<Contact
      key={friend.id}
      username={friend.username}
      email={friend.email}
    />)
  );

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
        label={globalSearch ? 'Search: All Users' : 'Search: My Contacts'}
      />
      <ul>
        {contacts}
      </ul>
    </>
  );
}
