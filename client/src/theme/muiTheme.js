import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    common: {
      black: '#36363E',
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
    },
    background: {
      default: '#F5F0EB'
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
  zIndex: {
    appBar: 1350
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
      },
      root: {
        color: '#36363E'
      }
    },
    MuiPaper: {
      root: {
        color: '#36363E'
      },
      elevation1: {
        boxShadow: '0 5px 5px rgba(0, 0, 0, 0.25), 0 5px 5px rgba(0, 0, 0, 0.22)'
      }
    },
    MuiButtonBase: {
      root: {
        color: '#36363E'
      }
    },
    MuiListItem: {
      gutters: {
        paddingLeft: 0,
        paddingRight: 0
      }
    },
    MuiMenuItem: {
      gutters: {
        paddingLeft: '1em',
        paddingRight: '1em'
      }
    }
  }
});

export default theme;
