import React from 'react';
import Chip from '@material-ui/core/Chip';

export default function UserChip(props) {

  return (
    <Chip label={props.username} />
  )
}
