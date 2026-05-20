import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#e5e5e5', contrastText: '#000000' },
    secondary: { main: '#737373' },
    background: { default: '#000000', paper: '#111111' },
    divider: 'rgba(255, 255, 255, 0.1)',
    text: { primary: '#fafafa', secondary: '#a3a3a3' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Roboto", system-ui, sans-serif',
    h1: { fontFamily: '"Playfair Display", Georgia, serif' },
    h2: { fontFamily: '"Playfair Display", Georgia, serif' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 12, fontWeight: 600 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: 'rgba(10, 10, 10, 0.9)',
        },
      },
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Provider store={store}>
        <SnackbarProvider
          maxSnack={2}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <Router>
            <App />
          </Router>
        </SnackbarProvider>
      </Provider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);