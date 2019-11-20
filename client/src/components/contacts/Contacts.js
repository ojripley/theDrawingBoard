import React from 'react';

import Contact from './Contact';

import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';



// boiled data
// will be replaced with an axios call
const friends = [
  {
    id: 2,
    username: 'ta',
    email: 'ta@mail.com'
  },
  {
    id: 3,
    username: 'tc',
    email: 'tc@mail.com'
  },
];

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

  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearchTermChange = event => {
    setSearchTerm = (event.target.value);
  }

  const contacts = friends.map(friend =>
    <Contact
      key={friend.id}
      username={friend.username}
      email={friend.email}
    />
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
      <ul>
        {contacts}
      </ul>
    </>
  );
}
