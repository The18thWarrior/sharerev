import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Delete } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {MenuItem, Select, FormHelperText } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import Grid from '@mui/material/Unstable_Grid2';
import { useContractFunction  } from '@usedapp/core';
import {ethers, utils} from 'ethers';
import { Contract } from '@ethersproject/contracts'
import LoadingButton from '@mui/lab/LoadingButton';
import {alchemyReadTransaction} from '../static/api';
import { makeId } from '../static/utility';
import { votingTypes, proposalTypes } from '../static/constants';
import groupAbi from '../contracts/Group.json';
// Custom Components
import ErrorToast from './ErrorToast';

//const poposalTypes = ['Allocation', 'Voting Type Change'];
export default function CreateProposal({store, currentAllocation, groupAddress, setResetList}) {
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const componentIsMounted = useRef(true);
  useEffect(() => {
    return () => {
      componentIsMounted.current = false
    }
  }, [])

  const wethInterface = new utils.Interface(groupAbi.abi);
  const contract = new Contract(groupAddress, wethInterface) as any;
  const { state: votingState, send: votingSend } = useContractFunction(contract, 'changeVoting', { transactionName: 'Change Voting' })
  const { state: proposalState, send: proposalSend } = useContractFunction(contract, 'createProposal', { transactionName: 'Proposal' })
  useEffect(() => {
    //console.log(votingState);
    if (votingState.status === 'Success') {
      alchemyReadTransaction(votingState.transaction.hash);
      setResetList(makeId(5));
      setSubmissionLoading(false);
      setCreateModalOpen(false);
    }
  }, [setResetList, votingState])

  useEffect(() => {
    //console.log(proposalState);
    if (proposalState.status === 'Success') {
      alchemyReadTransaction(proposalState.transaction.hash);
      setResetList(makeId(5));
      setSubmissionLoading(false);
      setCreateModalOpen(false);
    }
  }, [proposalState, setResetList])

  const [proposalType, setProposalType] = useState('');
  const handleProposalTypeChange = (event) => {
    setProposalType(event.target.value);
  };
  const [requestType, setRequestType] = useState(2);
  const [allocation, setAllocation] = useState([]);
  const [allocationTotal, setAllocationTotal] = useState(0);
  const [voteType, setVoteType] = useState(0);
  const handleVotingTypeChange = (event) => {
    setVoteType(event.target.value);
  };
  

  useEffect(() => {
    if (allocation.length === 0 && currentAllocation) {
      const _allocation = Object.keys(currentAllocation).map((val, i) => {
        return {id: makeId(8),address: val, allocation: currentAllocation[val]/10000};
      });
      setAllocation(_allocation);
    }
  }, [allocation.length, currentAllocation]);

  useEffect(() => {
    if (allocation.length > 0) {
      setValidationError(false);
      const _allocationTotal = allocation.reduce((total, current) => {
        if (!ethers.utils.isAddress(current.address)) {
          setValidationError(true);
        }
        return total + current.allocation;
      }, 0);
      setAllocationTotal(_allocationTotal);
    }
    
  }, [allocation])

  /**/
  const mintProposal = async function() {
    try {
      setSubmissionLoading(true);

      if (Object.entries(allocation).length > 0) {     
        const computedAllocation = allocation.map((row) => {
          return row.allocation*10000;
        });
        const computedMemberList = allocation.map((row) => {
          return ethers.utils.getAddress(row.address);
        })
        proposalSend(requestType, computedMemberList, computedAllocation)
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

  const mintChangeVoteProposal = async function() {
    try {
      setSubmissionLoading(true);            
      votingSend(voteType);
      //await createChangeVoteProposal(voteType, groupAddress, store);   
    } catch (err) {
      console.log(err);
      setSubmissionLoading(false);
      var errorMessage = err.message.substr(0, err.message.indexOf('(')); 
      setErrorMessage(errorMessage);
    }
  }

  function newProposal() {
    setCreateModalOpen(true);
  }

  function closeNewProposalModal() {
    setProposalType('');
    setRequestType(2);
    setAllocation(Object.keys(currentAllocation).map((val, i) => {
      return {id: makeId(8), address: val, allocation: currentAllocation[val]/10000};
    }));
    setCreateModalOpen(false);
  }

  const handleDeleteClick = (id) => () => {
    setAllocation(allocation.filter((row) => row.id !== id));
  };

  const handleRowChange = (props, event) => {
    const validatedRows = allocation.map((item) => {
      //console.log(changeObject.id, item.id);
      if (props.id === item.id) {
        item[props.field] = props.value;
      } 
      return item;      
    });
    setAllocation(validatedRows);
  }

  const handleAddClick = () => {
    setAllocation([...allocation, {id: makeId(8), address: '', allocation: 0}]);
  } 

  const columns = [
    {
      field: 'address',
      headerName: 'Address',
      type: 'string',
      flex: 4,
      editable: true,
      preProcessEditCellProps: (params) => {
        //console.log('hasError', hasError);
        return { ...params.props, error: false };
      },
    },
    {
      field: 'allocation',
      headerName: 'Allocation',
      type: 'number',
      flex: 2,
      editable: true,
      valueFormatter: (params) => {
        if (params.value == null) {
          return '';
        }

        const valueFormatted = Number(params.value).toLocaleString();
        return `${valueFormatted} %`;
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      flex: 1,
      cellClassName: 'actions',
      getActions: ({ id }) => {
          return [
            <GridActionsCellItem
              icon={<Delete />}
              label="Delete"
              onClick={handleDeleteClick(id)}
              color="inherit"
            />
          ]
      }
    },
  ];

  const GridArea = () => {
    return (
      <Box sx={{mt: 10}}>
        <DataGrid
          rows={allocation}
          columns={columns}
          autoHeight
          hideFooter
          disableSelectionOnClick
          onCellEditCommit={handleRowChange}
          ></DataGrid>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{my: 0}}>
        {/*<IconButton aria-label="addRecord" onClick={newChannel}>
          <AddIcon />
        </IconButton>*/}
        <Button variant="contained" onClick={newProposal} sx={{
          ml:'auto', display: 'block', 
          borderRadius: "100rem", fontWeight:'600', 
          fontSize: '80%', textTransform: 'none'
        }}>New Proposal</Button>
      </Box>
      <Dialog open={createModalOpen} onClose={closeNewProposalModal} fullWidth={true} maxWidth={'md'}>
        <DialogTitle>
          New Proposal
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={closeNewProposalModal}
            sx={{float:'right'}}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid xs={10}>
              <Select
                id="proposalType"
                variant="standard"
                value={proposalType}
                label="Proposal Type"                   
                onChange={handleProposalTypeChange}    
                sx={{mt:2, minWidth: 200}}
              >
                {
                  proposalTypes.map((oKey) => (
                    <MenuItem value={oKey} key={oKey}>{oKey}</MenuItem>
                  ))
                }
              </Select>
              <FormHelperText >Proposal Type</FormHelperText>
            </Grid>
            <Grid xs={2}>
              {proposalType === 'Allocation' &&
                <IconButton color="primary" aria-label="add allocation row" onClick={handleAddClick} sx={{ml:"auto", display:'block',color: "text.primary"}}>
                  <AddIcon />
                </IconButton>
              }
            </Grid>
          </Grid>
            

            {proposalType === 'Allocation' &&
              <>
                <GridArea></GridArea>

                <LoadingButton
                  component="span"
                  loading={submissionLoading}
                  variant="contained"
                  onClick={mintProposal}
                  sx={{mt:10}}
                  disabled={allocation === currentAllocation || allocation.length === 0 || allocationTotal !== 100 || validationError}
                >
                  Create Proposal
                </LoadingButton>
              </>
            }

            {proposalType === 'Voting Type Change' && 
              <>
                <Select
                  id="voteType"
                  variant="standard"
                  value={voteType}
                  label="Voting Type"                   
                  onChange={handleVotingTypeChange}    
                  sx={{mt:10, minWidth: 200}}
                >
                  {
                    votingTypes.map((oKey, i) => (
                      <MenuItem value={i} key={oKey}>{oKey}</MenuItem>
                    ))
                  }
                </Select>
                <FormHelperText >Vote Type</FormHelperText>

                <LoadingButton
                  component="span"
                  loading={submissionLoading}
                  variant="contained"
                  onClick={mintChangeVoteProposal}
                  sx={{mt:10}}
                >
                  Create Proposal
                </LoadingButton>
              </>
            }

            
        </DialogContent>
      </Dialog>
      
      <ErrorToast errorMessage={errorMessage}></ErrorToast>
      
    </>
  );
}


