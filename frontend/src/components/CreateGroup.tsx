import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useEthers, useContractFunction  } from '@usedapp/core';
import {ethers, utils} from 'ethers';
import { Contract } from '@ethersproject/contracts'
//import { basicSvg } from '../../../../static/constants';
import LoadingButton from '@mui/lab/LoadingButton';
import {alchemyReadTransaction} from '../static/api';
import { makeId } from '../static/utility';
import { env } from '../static/constants';
import groupFactoryAbi from '../contracts/GroupFactory.json';
// Custom Components
import ErrorToast from './ErrorToast';

export default function CreateGroup({store, setResetList}) {
  const {chainId} = useEthers();
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [createModalOpen, setCreateModalOpen] = React.useState(false);

  const groupFactoryAddress = (chainId ===  Number(env.REACT_APP_CHAIN_ID)) ? env.REACT_APP_GROUP_FACTORY_ADDRESS_LOCAL : env.REACT_APP_GROUP_FACTORY_ADDRESS_MUMBAI;
  const wethInterface = new utils.Interface(groupFactoryAbi.abi);
  const contract = new Contract(groupFactoryAddress, wethInterface) as any;
  const { state, send } = useContractFunction(contract, 'createGroupContract', { transactionName: 'Wrap' })
  useEffect(() => {
    //console.log(state);
    if (state.status === 'Success') {
      alchemyReadTransaction(state.transaction.hash);
      setResetList(makeId(5));
      setSubmissionLoading(false);
      setCreateModalOpen(false);
    }
  }, [setResetList, state])
  const [groupName, setGroupName] = useState('');
  const handleNameChange = (event) => {
    setGroupName(event.target.value);
  };

  /**/

  const createGroup2 = async function(name, store) {
    const options = {value: ethers.utils.parseEther("0")}
    let nftTx = await send(name, options);
    //console.log('nftTx',nftTx);
    //let storeTxns = store.getState('transactions');
    //const newTxnList = [...storeTxns.value, nftTx];
    //store.onStoreUpdate('transactions', newTxnList);
    return 'success'; 
  }

  

  const mintGroup = async function() {
    try {
      setSubmissionLoading(true);

      if (groupName.length > 0) {     
        await createGroup2(groupName, store);
      } else {
        setSubmissionLoading(false);
      }
    } catch (err) {
      console.log(err);
      setSubmissionLoading(false);
      var errorMessage = err.message.substr(0, err.message.indexOf('(')); 
      setErrorMessage(errorMessage);
    }
  }

  function newGroup() {
    setCreateModalOpen(true);
  }

  function closeNewGroupModal() {
    setGroupName('');
    setCreateModalOpen(false);
  }

  return (
    <>
      <Box sx={{my: 0}}>
        {/*<IconButton aria-label="addRecord" onClick={newChannel}>
          <AddIcon />
        </IconButton>*/}
        <Button variant="contained" onClick={newGroup} sx={{
          ml:'auto', display: 'block', 
          borderRadius: "100rem", fontWeight:'600', 
          fontSize: '80%', textTransform: 'none'
        }}>New Group</Button>
      </Box>
      <Dialog open={createModalOpen} onClose={closeNewGroupModal}>
        <DialogTitle>
          New Group
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={closeNewGroupModal}
            sx={{float:'right'}}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
            <TextField
              id="groupName"
              helperText="Group Name"
              variant="standard"
              fullWidth
              value={groupName}
              onChange={handleNameChange}
              sx={{display: 'block', mx: "auto", width:500}}
            />  
            <LoadingButton
              component="span"
              loading={submissionLoading}
              variant="contained"
              onClick={mintGroup}
            >
              Create
            </LoadingButton>
        </DialogContent>
      </Dialog>
      
      <ErrorToast errorMessage={errorMessage}></ErrorToast>
      
    </>
  );
}


