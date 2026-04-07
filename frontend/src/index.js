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
    primary: { main: '#38bdf8' },
    background: { default: '#0b0f14', paper: '#151c26' },
    divider: 'rgba(148, 163, 184, 0.12)',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Roboto", system-ui, sans-serif',
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