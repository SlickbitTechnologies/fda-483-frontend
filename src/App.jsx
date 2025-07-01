import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Grid, useTheme, useMediaQuery } from '@mui/material';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
  <AppBar position="static" sx={{ 
    background: '#fff', 
    color: '#222', 
    boxShadow: 0, 
    borderBottom: '1px solid #eee', 
    width: '100vw' 
  }}>
    <Toolbar sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingTop: { xs: 1, sm: 1.5, md: 2 },
      paddingBottom: { xs: 1, sm: 1.5, md: 2 },
      paddingX: { xs: 2, sm: 3, md: 4 },
      minHeight: { xs: '64px', sm: '72px', md: '80px' }
    }}>
      <Grid sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-start', 
        pl: { xs: 0, sm: 2, md: 10 },
        flex: 1
      }}>
        <Typography variant={isMobile ? "h6" : "h5"} sx={{ 
          fontWeight: 700,
          fontSize: { xs: '18px', sm: '20px', md: '24px' },
          lineHeight: { xs: '1.2', sm: '1.3', md: '1.4' }
        }}>
          Trend 483
        </Typography>
        <Typography variant={isMobile ? "body2" : "subtitle1"} sx={{ 
          color: '#5c6470',
          fontSize: { xs: '12px', sm: '14px', md: '16px' },
          display: { xs: 'none', sm: 'block' }
        }}>
          Timeline Analysis
        </Typography>
      </Grid>
      {!isDashboard ? 
        <Button 
          component={Link} 
          to="/" 
          sx={{ 
            color: '#222', 
            fontWeight: 500, 
            mr: { xs: 0, sm: 2, md: 10 }, 
            border: '1px solid #b3a9a9', 
            borderRadius: 2, 
            padding: { xs: '6px 12px', sm: '8px 16px', md: '8px 16px' },
            textTransform: 'none',
            fontSize: { xs: '12px', sm: '14px', md: '16px' },
            minWidth: { xs: 'auto', sm: 'auto' },
            whiteSpace: 'nowrap'
          }}
        >
          <RestoreOutlinedIcon sx={{ 
            fontSize: { xs: 16, sm: 18 }, 
            paddingRight: { xs: 0.5, sm: 1 },
            display: { xs: 'none', sm: 'inline' }
          }} />
          <Box sx={{ display: { xs: 'block', sm: 'inline' } }}>
            {isSmallMobile ? 'Timeline' : 'Timeline Analysis'}
          </Box>
        </Button>
      :
        <Button 
          component={Link} 
          to="/browse" 
          sx={{ 
            color: '#222', 
            fontWeight: 500, 
            mr: { xs: 0, sm: 2, md: 10 }, 
            border: '1px solid #b3a9a9', 
            borderRadius: 2, 
            padding: { xs: '6px 12px', sm: '8px 16px', md: '8px 16px' },
            textTransform: 'none',
            fontSize: { xs: '12px', sm: '14px', md: '16px' },
            minWidth: { xs: 'auto', sm: 'auto' },
            whiteSpace: 'nowrap'
          }}
        >
          <SearchOutlinedIcon sx={{ 
            fontSize: { xs: 16, sm: 18 }, 
            paddingRight: { xs: 0.5, sm: 1 },
            display: { xs: 'none', sm: 'inline' }
          }} />
          <Box sx={{ display: { xs: 'block', sm: 'inline' } }}>
            {isSmallMobile ? 'Browse' : 'Browse 483s'}
          </Box>
        </Button>
      }
    </Toolbar>
  </AppBar>
  )
}

export default App;
