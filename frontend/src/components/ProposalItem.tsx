import {Accordion, AccordionSummary, AccordionDetails, Box, Button, ButtonGroup, Chip, Typography, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { ExpandMore } from '@mui/icons-material';
import { useEthers } from '@usedapp/core';
import { useEffect, useState } from 'react';
import { getVoteDetails, getVoteMemberList, getVoteMemberAllocation, getVoteMemberOutcome, getVotingMemberList, castVote } from '../static/blockchain';
import { actionTypes, voteOutcomes } from '../static/constants';
import ErrorToast from './ErrorToast';

export default function ProposalItem({groupAddress, voteIndex, store}) {
  const { account } = useEthers();
  const [expanded, setExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [requestType, setRequestType] = useState('');
  const [outcome, setOutcome] = useState('');
  const [memberList, setMemberList] = useState([]);
  const [votingMemberList, setVotingMemberList] = useState([]);
  const [allocation, setAllocation] = useState({});
  const [votes, setVotes] = useState({});

  // Get Vote Details
  useEffect(() => {
    const runAsync = async () => {
      const voteDetails = await getVoteDetails(groupAddress, voteIndex);
      setRequestType(actionTypes[voteDetails.requestType]);
      setOutcome(voteOutcomes[voteDetails.outcome]);
    }

    if (groupAddress && account) {
      runAsync();
    }
  }, [groupAddress, voteIndex, expanded, account]);

  // Get Memberlist
  useEffect(() => {
    const runAsync = async () => {
      const _memberList = await getVoteMemberList(groupAddress, voteIndex);
      setMemberList(_memberList);
    }
    if (groupAddress && expanded && account) {
      runAsync();
    }
  }, [groupAddress, voteIndex, expanded, account]);
  
  // Get Voting Memberlist
  useEffect(() => {
    const runAsync = async () => {
      const _memberList = await getVotingMemberList(groupAddress, voteIndex);
      setVotingMemberList(_memberList);
    }
    if (groupAddress && expanded && account) {
      runAsync();
    }
  }, [groupAddress, voteIndex, expanded, account]);
  
  // Get Member Allocation
  useEffect(() => {
    const runAsync = async () => {
      const _allocationList = await memberList.map(async (memberAddress) => {
        return await getVoteMemberAllocation(groupAddress, voteIndex, memberAddress);
      });
      const results = await Promise.allSettled(_allocationList);
      
      const allocationList = results.map((val, i) => {
        const memberAddress = memberList[i];
        return {[memberAddress] : val['value']};
      });
      const allocationMap = Object.assign({}, ...allocationList);
      setAllocation(allocationMap);
    }
    if (memberList.length > 0 && expanded && account) {
      runAsync();
    }
  }, [memberList, groupAddress, voteIndex, expanded, account]);

  // Get Member Votes
  useEffect(() => {
    const runAsync = async () => {
      const _outcomeList = await votingMemberList.map(async (memberAddress) => {
        return await getVoteMemberOutcome(groupAddress, voteIndex, memberAddress);
      });
      const results = await Promise.allSettled(_outcomeList);
      
      const outcomeList = results.map((val, i) => {
        const memberAddress = votingMemberList[i];
        return {[memberAddress] : val['value']};
      });
      const outcomeMap = Object.assign({}, ...outcomeList);
      //console.log(outcomeMap);
      setVotes(outcomeMap);
    }
    if (votingMemberList.length > 0 && expanded && account) {
      runAsync();
    }
  }, [votingMemberList, groupAddress, voteIndex, expanded, account]);

  const submitVote = async (vote) => {
    try {         
      await castVote(groupAddress, voteIndex, vote, store);
    } catch (err) {
      console.log(err);
      var errorMessage = err.message.substr(0, err.message.indexOf('(')); 
      setErrorMessage(errorMessage);
    }
  }

  const VoteOutcomeTable = () => {
    return (
      <TableContainer component={Paper} >        
        <Table sx={{ minWidth: 400 }} aria-label="simple table">
          <TableHead>
            <TableRow sx={{border: 'none'}}>
              <TableCell colSpan={3} sx={{fontWeight: 'bold'}}>Voting Results</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Address</TableCell>
              <TableCell align="right">Vote</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {votingMemberList.map((member) => {
              return (
                <TableRow
                  key={member}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">{member}</TableCell>
                  <TableCell align="right">{voteOutcomes[votes[member]]}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  const AllocationTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 400 }} aria-label="simple table">
          <TableHead>
            <TableRow sx={{border: 'none'}}>
              <TableCell colSpan={3} sx={{fontWeight: 'bold'}}>Allocation</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Address</TableCell>
              <TableCell align="right">Allocation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(allocation).length > 0 && 
              memberList.map((member) => {
                return (
                  <TableRow
                    key={member}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">{member}</TableCell>
                    <TableCell align="right">{allocation[member].toNumber()/10000}%</TableCell>
                  </TableRow>
                )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  const VotingButton = () => {
    return (
      <>
        {
          outcome === 'Pending' && 
          <ButtonGroup variant="contained" aria-label="outlined primary button group" sx={{}}>
            <Button onClick={() => {submitVote(true)}}>Approve</Button>
            <Button onClick={() => {submitVote(false)}} color={'warning'}>Reject</Button>
          </ButtonGroup>
        }
      </>
    );
  };

  return (
    <Box sx={{my: 5, mx:20}}>
      <Accordion expanded={expanded} onChange={() => {setExpanded(!expanded)}} sx={{p:4}} elevation={3}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1bh-content"
          id={voteIndex + "-header"}
        >
          <Box sx={{width: '10%', flexShrink: 0}}>
            <Chip label={'Vote Id: '+voteIndex} sx={{fontWeight: 'bold'}}/>
          </Box>          
          <Typography sx={{ width: '70%', flexShrink: 0}} variant={'subtitle1'}>
            Outcome: {outcome}
          </Typography>
          <VotingButton></VotingButton>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" spacing={2}  alignItems="center" sx={{mb:6}}>
            <Typography variant='body1'>Request Type:</Typography>          
            <Typography variant='body2'>{requestType}</Typography>
          </Stack>
          <Grid container> 
            <Grid xs={12} md={5}>
              <AllocationTable></AllocationTable>
            </Grid>
            <Grid xs={12} md={5} mdOffset={2}>
              <VoteOutcomeTable></VoteOutcomeTable>
            </Grid>
          </Grid>               
        </AccordionDetails>
      </Accordion>
      
      <ErrorToast errorMessage={errorMessage}></ErrorToast>
    </Box>
  )
}