import React, { useEffect, useRef } from 'react';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

function ErrorToast(input) {
  const [openError, setOpenError] = React.useState(false);
  const [currentError, setCurrentError] = React.useState('');
  const handleCloseError = () => {
    setOpenError(false);
    setCurrentError('');
  };  
  const componentIsMounted = useRef(true);
  useEffect(() => {
    return () => {
      componentIsMounted.current = false
    }
  }, []);

  useEffect(() => {    
    if (input.errorMessage !== currentError && input.errorMessage != null) {
      setCurrentError(input.errorMessage);
      setOpenError(true);
    } else {
      setTimeout(() => {
        setOpenError(false);
        //setCurrentError('');
      }, 2000)
    }
  }, [currentError, input.errorMessage])

  const errorAction = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleCloseError}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return ( 
    <Snackbar
      open={openError}
      autoHideDuration={6000}
      onClose={handleCloseError}
      message={currentError}
      action={errorAction}
    />
  )
};

export default ErrorToast;
