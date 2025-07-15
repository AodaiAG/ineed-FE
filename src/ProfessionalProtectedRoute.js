import React, { createContext, useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthCheck from './hooks/useAuthCheck';
import { NotificationProvider } from './contexts/NotificationContext';
import { CircularProgress, Box } from '@mui/material';

// ✅ Create context for professional authentication
const ProfessionalAuthContext = createContext();

// ✅ Custom hook to use this context
export const useProfessionalAuth = () => useContext(ProfessionalAuthContext);

const ProfessionalProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuthCheck();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress size={60} thickness={5} sx={{ color: '#FDBE00' }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Store the return URL in sessionStorage
    sessionStorage.setItem('returnUrl', location.pathname);
    return <Navigate to="/pro/enter" />;
  }

  return (
    <NotificationProvider userId={user.profId} userType="professional">
      <ProfessionalAuthContext.Provider value={{ user, isAuthenticated }}>
        {children}
      </ProfessionalAuthContext.Provider>
    </NotificationProvider>
  );
};

export default ProfessionalProtectedRoute;
