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
  typography: {
    h2: {
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 500,
      fontSize: "1.2em",
      lineHeight: 1.75,
      letterSpacing: "0.02857em",
      textTransform: "uppercase",
      textAlign: 'center'
    },
  },
  overrides: {
    MuiExpansionPanelSummary: {
      content: {
        marginTop: 0,
        marginBottom: 0
      }
    },
    MuiDivider: {
      root: {
        backgroundColor: 'rgba(2,104,115, 0.5)',
      }
    }
  }
});

export default theme;