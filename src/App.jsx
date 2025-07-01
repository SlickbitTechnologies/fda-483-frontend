import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Grid } from '@mui/material';
import Dashboard from './pages/Dashboard';
import Browse from './pages/Browse';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import { FirebaseDataProvider } from './context/firebaseProvider';
function App() {

  return (
    <FirebaseDataProvider>
      <Router>
        <Header />
        <Box>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/browse" element={<Browse />} />
          </Routes>
        </Box>
      </Router>
      </FirebaseDataProvider>
  );
}

const Header = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
  <AppBar position="static" sx={{ background: '#fff', color: '#222', boxShadow: 0, borderBottom: '1px solid #eee', width: '100vw' }}>
    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2}}>
      <Grid sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pl: 10 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, }}>Trend 483</Typography>
        <Typography variant="subtitle1" sx={{ color: '#5c6470'}}>Timeline Analysis</Typography>
      </Grid>
      {!isDashboard ? 
        <Button component={Link} to="/" sx={{ color: '#222', fontWeight: 500, mr: 10, border: '1px solid #b3a9a9', borderRadius: 2, padding: 1, textTransform: 'none' }}><RestoreOutlinedIcon sx={{ fontSize: 18, paddingRight: 1 }} />Timeline Analysis</Button>
      :
        <Button component={Link} to="/browse" sx={{ color: '#222', fontWeight: 500, mr: 10, border: '1px solid #b3a9a9', borderRadius: 2, padding: 1, textTransform: 'none' }}><SearchOutlinedIcon sx={{ fontSize: 18, paddingRight: 1 }} />Browse 483s</Button>
      }
    </Toolbar>
  </AppBar>
  )
}

export default App;
