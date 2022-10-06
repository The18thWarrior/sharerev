import React from 'react';
import './App.css';
import store from './static/state';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import {Box} from '@mui/material';

const MainBox = styled(Box)(({ theme }) => ({
  bgcolor: 'text.disabled',
  display: 'block',
  height: ' 100%',
  minHeight: 'calc(100vh - 8rem)',
  overflowX: 'hidden',
  backgroundColor: theme.palette.mode === 'dark' ? '#282c34' : '#00000',
  marginTop: '4rem',
  marginBottom: '4rem',
}));

function App() {
  React.useEffect(() => {
    document.title = "ShareRev";
  }, []);

  const [mdTheme, ] = React.useState(createTheme({
    spacing: 2,
    palette: {
      mode: 'dark',
      primary: {
        main: '#00784A'
      },
      secondary: {
        main: '#9a0d32'
      }
    }
  }));

  return (   
    <ThemeProvider theme={mdTheme}> 
      <BrowserRouter>
        <Header store={store}/>
        <MainBox>
          <Routes>
            <Route path='/' element={<Landing store={store}/>} />
            <Route path='/dashboard' element={<Dashboard store={store}/>} />
          </Routes>
        </MainBox>
        <Footer/>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
