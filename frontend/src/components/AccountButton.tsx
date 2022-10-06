import React, { useEffect, useState, useRef } from 'react';
import { useEthers } from '@usedapp/core';
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';

import TransactionHandler from './TransactionHandler';

export const AccountButton = ({store}) => {
  const { account, error, activateBrowserWallet, chainId, deactivate } = useEthers();
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);  
  const componentIsMounted = useRef(true);
  useEffect(() => {
    return () => {
      componentIsMounted.current = false
    }
  }, []);
  
  const [, setActivateError] = useState('');
  useEffect(() => {
    //console.log(account, chainId, error);
    if (error) {
      //setActivateError(error.message);
      const errorData = JSON.parse(error.message);
      console.log('error', errorData.code);
      if(error.name === 'UnsupportedChainIdError') {
        setErrorModalOpen(true);
      } else if (errorData.code === 1013) {
        activateBrowserWallet();
      }
    } else if (chainId && String(chainId) !== '31337' && String(chainId) !== '80001') {
      console.log('wrong chain');
      setErrorModalOpen(true);
    } else {
      //console.log('right chain');
      setErrorModalOpen(false);
      //setActivateError('')
    }
    //console.log((library && String(library.network.chainId) !== '31337' && String(library.network.chainId) !== '80001'));
  }, [error, chainId, account, activateBrowserWallet]);


  const activate = async () => {
    setActivateError('')
    activateBrowserWallet()
    setErrorModalOpen(false);
  }

  const disconnect = async () => {
    setActivateError('')
    deactivate();
    setErrorModalOpen(false);
  }

  function doNotClose() {
    console.log('sorry you can\'t close this');
  }

  return (
    <div style={{display:'inline-block'}}>
      {/*<div>{activateError}</div>*/}
      {account ? (
        <>         
          <TransactionHandler store={store}></TransactionHandler>
          <Button color="primary" variant="contained"
            onClick={disconnect}
          >Disconnect</Button>
        </>
      ) : (
        <Button color="primary" variant="contained"
          onClick={activate}
        >Connect</Button>
      )}

      <Dialog 
        open={errorModalOpen} 
        onClose={doNotClose}
        disableEscapeKeyDown={true}
        onBackdropClick={doNotClose}
      >
        <DialogContent>
          <Box sx={{ }} className="transparent-background">
            Connected to wrong network, please switch to Polygon Testnet.             
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  )
}

