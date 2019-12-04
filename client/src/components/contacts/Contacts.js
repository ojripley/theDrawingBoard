import React, { useState, useEffect } from 'react';

import Contact from './Contact';
import Chat from './Chat';
import useDebounce from "../../hooks/useDebounce";

import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

const useStyles = makeStyles(() => ({
  textField: {
    flexBasis: '100%',
    width: 'auto',
    height: 'auto',
    alignSelf: 'center',
    justifySelf: 'center'
  },
}));

export default function Contacts(props) {

  const classes = useStyles();
  const [searchTerm, setSearchTerm] = useState('');
  const [contactsList, setContactsList] = useState([]);
  const [globalSearch, setGlobalSearch] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 100);
  const [viewChat, setViewChat] = useState(0);

  useEffect(() => { //jumps to top of page on mount
    window.scrollTo(0, 0)
  }, []);

  // gerald the error herald easter egg
  const handleKeyPress = event => {
    if (event.charCode === 13 && event.target.value === 'summon gerald') {
      props.setError({
        type: 'default',
        msg: 'I am Gerald, the Error Herald! Whenever you see me, fear not; I suffer the burden of catching errors so you don\'t have to. Refresh the page and continue on your quest!'
      })
    }
  };

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

  const displayChat = (id) => {
    setViewChat(id);
  }

  useEffect(() => {
    // clean up socket event when switching between global search
    if (props.socketOpen) {
      props.socket.off('relationChanged');
    }
  }, [globalSearch, props.socket, props.socketOpen]);

  useEffect(() => {
    if (props.socketOpen) {
      if (globalSearch) {
        // emit global search
        props.socket.emit('fetchContactsGlobal', { username: debouncedSearchTerm, user: props.user });
        props.socket.on('contactsGlobal', (data) => {
          setContactsList(data);
        });

        // close event after receiving data. Prevents multiple events
        return () => props.socket.off('contactsGlobal');
      } else {

        // emit contact search
        props.socket.emit('fetchContactsByUserId', { id: props.user.id, username: debouncedSearchTerm });
        props.socket.on('contactsByUserId', (data) => {
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
      return (<Contact
        key={friend.id}
        contact={friend}
        displayChat={displayChat}
        user={props.user}
        socket={props.socket}
        socketOpen={props.socketOpen}
      />);
    }
    return null;
  });

  return (
    <>
      {viewChat !== 0 ? (<Chat
        user={props.user}
        recipient={contactsList.find(friend => friend.id === viewChat)}
        recipientId={viewChat}
        socket={props.socket}
        socketOpen={props.socketOpen}
        setViewChat={setViewChat}
      />) :
        (<><div>
          <Typography id='page-header' variant='h2' color='primary'>Contacts</Typography >
          <Divider />
        </div >
          <div id='search-container'>
            <TextField
              id="outlined-name"
              label="Search"
              className={classes.textField}
              value={searchTerm}
              onChange={handleSearchTermChange}
              margin="normal"
              onKeyPress={handleKeyPress}
            />
            <label className='search-label' htmlFor='upload-initial-doc'>
              <Typography variant='overline'>{globalSearch ? 'Search: All Users' : 'Search: Contacts'}</Typography>
            </label>
            <Switch
              id='toggle-global-search'
              checked={globalSearch}
              onChange={handleGlobalSearchChange}
              value="checked"
              color="secondary"
            />
          </div>
          <ul className='contact-list'>
            {contacts}
          </ul>
        </>)
      }
    </>
  );
}
