import React from 'react';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';

export default function TabBarItem(props) {
  return (
    <BottomNavigationAction label={props.label} value={props.label} icon={props.icon} />
  );
}
