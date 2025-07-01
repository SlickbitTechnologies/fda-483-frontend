import { createContext, useContext, useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Snackbar, Alert } from '@mui/material';

// Create context
const FirebaseDataContext = createContext();
const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

// Provider component
export const FirebaseDataProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  const showToast = (message, severity = 'info') => {
    setToast({ open: true, message, severity });
  };
  const handleClose = () => {
    setToast({ ...toast, open: false });
  };

  // const fetchFirebaseData = async () => {
  //   try {
  //     const companiesRef = collection(db, 'fda-483-documents');
  //     const snapshot = await getDocs(companiesRef);
  //     const result = snapshot.docs.map(doc => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
  //     setDocuments(result);
  //   } catch (error) {
  //     showToast('Error fetching Firebase data', 'error');
  //     console.error('Error fetching Firebase data:', error);
  //   }
  // };

  // useEffect(() => {
  //   fetchFirebaseData();
  // }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
        {children}
        <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleClose} severity={toast.severity} sx={{ width: '100%', }}>
            {toast.message}
          </Alert>
        </Snackbar>
    </ToastContext.Provider>
  );
};

// Custom hook
export const useFirebaseData = () => useContext(FirebaseDataContext);
