import React, { useState } from 'react';
import './App.scss';
import Box from '@material-ui/core/Box';

// COMPONENTS
import TabBar from './TabBar';
import NavBar from './NavBar';
import Active from './components/active/Active';
import Contacts from './components/contacts/Contacts';
import Dashboard from './components/dashboard/Dashboard';
import History from './components/history/History';

export default function App() {
  // const LOGIN = 'LOGIN';
  const loggedIn = true;//Change this :)
  const DASHBOARD = 'DASHBOARD';
  const HISTORY = 'HISTORY';
  const CONTACTS = 'CONTACTS';
  const ACTIVE = 'ACTIVE';

  const [mode, setMode] = useState(DASHBOARD);
  //top nav
  //login page if not logged in
  //dashboard if logged in

  if (loggedIn) {
    return (
      //If logged in show dashboard
      <Box>
      <NavBar />
        {mode === DASHBOARD && <Dashboard />}
        {mode === HISTORY && <History />}
        {mode === CONTACTS && <Contacts />}
        {mode === ACTIVE && <Active />}
        <TabBar mode={mode} setMode={setMode} />
      </Box >

    );
  } else {
    return (
      <h1> Replace with login page </h1>
    );

  }
}
