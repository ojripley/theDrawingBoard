import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    common: {
      black: '#000',
      white: '#fff',
    },
    primary: {
      main: '#026873',
      contrastText: '#FFF3E8'
    },
    secondary: {
      main: '#D46337',
      contrastText: '#FFF3E8'
    },
    tertiary: {
      main: '#FFF3E8',
      contrastText: '#36363E',
    }
  },
});

export default theme;
