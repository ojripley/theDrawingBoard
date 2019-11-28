import React, { useState, useEffect } from 'react';

// Material UI - Text Inputs
import TextField from '@material-ui/core/TextField';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Button from '@material-ui/core/Button';


// Material UI - Date & Time Pickers
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker,
} from '@material-ui/pickers';

// Material UI - Name Selector
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  textField: {
    minWidth: '240px',
    height: 'auto'
  },
  formControl: {
    minWidth: '240px'
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
    backgroundColor: theme.palette.tertiary.main
  },
  button: {
    marginRight: '1em'
  },
  file: {
    width: '0.1px',
    height: '0.1px',
    opacity: 0,
    overflow: 'hidden',
    position: 'absolute',
    zIndex: '-1',
  },
  label : {
    marginTop: '1em'
  }
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, selectedContacts, theme) {
  return {
    fontWeight:
      selectedContacts.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
};

export default function Form(props) {
  const classes = useStyles();
  const theme = useTheme();

  const [contacts, setContacts] = useState([]);
  // const [fileArray, setFileArray] = useState([]);

  useEffect(() => {
    if (props.socketOpen) {
      props.socket.emit('fetchContactsByUserId', { id: props.user.id });
      props.socket.on('contactsByUserId', data => {
        console.log(data)
        setContacts(data);
      })
      return () => {
        props.socket.off('contactsByUserId');
      };
    }
  }, [props.socketOpen, props.socket, props.user.id])

  const handleContactChange = event => {
    console.log('selected contacts', event.target.value)
    props.setSelectedContacts(event.target.value);
  };

  const handleDateChange = date => {
    props.setSelectedDate(date);
  };

  const handleMeetingNameChange = event => {
    props.setMeetingName(event.target.value);
  }

  const handleMeetingDescChange = event => {
    props.setMeetingDesc(event.target.value);
  };

  const handleFileUpload = event => {
    if (event.target.files) {
      console.log('event.target.files:', event.target.files);
      props.setFiles({ name: event.target.files });
      // setFileArray(event.target.files.);
    }
  };

  const contactsList = contacts.map(contact => {

    if (contact.relation === 'accepted') {
      return (
        <MenuItem key={contact.id} value={contact} style={getStyles(contact.username, props.selectedContacts, theme)}>
          {contact.username}
        </MenuItem>
      )
    } else {
      return null;
    }
  });

  return (
      <div className={classes.container} noValidate autoComplete="off">
        <TextField
          label="Name"
          placeholder='Meeting Name'
          className={classes.textField}
          margin="normal"
          onChange={handleMeetingNameChange}
          inputProps={{ maxLength: 30 }}
          required
        />
        <TextField
          label="Description"
          multiline
          placeholder='Meeting Description'
          className={classes.textField}
          margin="normal"
          onChange={handleMeetingDescChange}
        />
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDateTimePicker
            margin="normal"
            id="date-picker-dialog"
            label="Date &amp; Time"
            format="yyyy/MM/dd hh:mm a"
            value={props.selectedDate}
            onChange={handleDateChange}
            disablePast
            orientation='portrait'
          />
        </MuiPickersUtilsProvider>
        <FormControl className={classes.formControl}>
          <InputLabel id="demo-mutiple-chip-label">Contacts</InputLabel>
          <Select
            labelId="demo-mutiple-chip-label"
            id="demo-mutiple-chip"
            multiple
            value={props.selectedContacts}
            onChange={handleContactChange}
            input={<Input id="select-multiple-chip" />}
            renderValue={selected => (
              <div className={classes.chips}>
                {selected.map(value => (
                  <Chip key={value.id} label={value.username} className={classes.chip} />
                ))}
              </div>
            )}
            MenuProps={MenuProps}
          >
            {contactsList}
          </Select>
        </FormControl>
          <input
            id='upload-initial-doc'
            className={classes.file}
            type='file'
            onChange={handleFileUpload}
            accept=".pdf,.jpeg, .png,.gif,.svg,.tiff,.ai,.jpg"
            multiple
          />
          <label className={classes.label} htmlFor='upload-initial-doc'>
            <Button variant='contained' color='primary' component="span" className={classes.button} startIcon={<CloudUploadIcon />}>
              Upload
            </Button>
          </label>
      </div>
  );
}
