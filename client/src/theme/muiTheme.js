import { createMuiTheme } from '@material-ui/core/styles';
import color from '@material-ui/core/colors/amber';

const theme = createMuiTheme({
  palette: {
    common: {
      black: '#000',
      white: '#fff',
    },
    primary: {
      main: '#026873',
      light: 'rgba(2,104,115, 0.4)',
      contrastText: '#F5F0EB'
    },
    secondary: {
      main: '#D46337',
      contrastText: '#F5F0EB'
    },
    tertiary: {
      main: '#F5F0EB',
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
      textAlign: 'left'
    },
    h6: {
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 500,
      fontSize: "1rem",
      lineHeight: 1.6,
      letterSpacing: "0.0075em",
    }
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
        backgroundColor: 'rgba(2,104,115, 0.8)',
      }
    },
    MuiButton: {
      textSizeSmall: {
        fontSize: '0.75rem'
      },
      outlinedSizeSmall: {
        fontSize: '0.75rem'
      }
    },
    MuiPaper: {
      root: {
        backgroundColor: 'none'
      }
    }
  }
});

export default theme;
