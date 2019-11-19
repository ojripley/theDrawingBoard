import React, { useState } from 'react';
import './App.scss';
import Box from '@material-ui/core/Box';

import TabBar from './TabBar';

export default function App() {
  // const LOGIN = 'LOGIN';
  const DASHBOARD = 'DASHBOARD';
  const HISTORY = 'HISTORY';
  const CONTACTS = 'CONTACTS';
  const ACTIVE = 'ACTIVE';

  const [mode, setMode] = useState(DASHBOARD);

  return (
    //top nav
    //login page if not logged in
    //dashboard if logged in
    <Box>
      <TabBar />
    </Box>
  );
}
