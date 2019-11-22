import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  formControl: {
    marginTop: '1em',
    width: 200,
    padding: '2em',
    border: 'solid 1px gray'
  }
}));


export default function FileUpload(props) {

  const classes = useStyles();

  return (
    <input className={classes.formControl} type='file' />
  );
}
