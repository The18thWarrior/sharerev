import {Accordion, AccordionSummary, AccordionDetails, Badge, Box, Chip, Typography, Stack, Tooltip} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { ethers } from 'ethers';
import { ExpandMore } from '@mui/icons-material';
import { useEthers } from '@usedapp/core';
import { useEffect, useState } from 'react';
import CreateProposal from './CreateProposal';
import ProposalItem from './ProposalItem';
import { getGroupDetails, getGroupAllocation, getGroupVotingIndex, getMemberBalance, withdrawBalance } from '../static/blockchain';
import { votingTypes } from '../static/constants';
import { BigNumber } from 'ethers';
import ErrorToast from './ErrorToast';

export default function GroupItem({groupAddress, store}) {
  const { account } = useEthers();
  const [expanded, setExpanded] = useState(false);
  const [openTooltip, setOpenTooltip] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupId, setGroupId] = useState(0);
  const [balance, setBalance] = useState(BigNumber.from(0));
  const [votingType, setVotingType] = useState('');
  const [memberList, setMemberList] = useState([]);
  const [allocation, setAllocation] = useState({});
  const [resetList, setResetList] = useState('');
  const [votingIndex, setVotingIndex] = useState(BigNumber.from(0));

  useEffect(() => {
    const runAsync = async () => {
      const _groupDetails = await getGroupDetails(groupAddress);
      //console.log(_groupDetails);
      setGroupName(_groupDetails.name);
      setGroupId(_groupDetails.groupId);
      setVotingType(_groupDetails.votingType);
      setMemberList(_groupDetails.memberList);
    }
    if (groupAddress && account) {
      runAsync();
    }
  }, [groupAddress, resetList, account]);

  useEffect(() => {
    const runAsync = async () => {
      const _allocationList = await memberList.map(async (memberAddress) => {
        return await getGroupAllocation(groupAddress, memberAddress);
      });
      const results = await Promise.allSettled(_allocationList);
      //const typeFix = await Promise.all(results);
      const allocationList = results.map((val, i) => {
        const memberAddress = memberList[i];
        return {[memberAddress] : val['value']};
      });
      const allocationMap = Object.assign({}, ...allocationList);
      //console.log(allocationMap);
      setAllocation(allocationMap);
    };
    if (memberList.length > 0 && account) {
      runAsync();
    }
  }, [memberList, groupAddress, resetList, account]);

  useEffect(() => {
    const runAsync = async () => {
      const memberBalance = await getMemberBalance(groupAddress);
      //console.log(memberBalance.toString());
      setBalance(memberBalance);
    };

    if (groupAddress && account) {
      //console.log(groupAddress);
      runAsync();
    }
  }, [groupAddress, account]);

  useEffect(() => {
    const runAsync = async () => {
      const _votingIndex = await getGroupVotingIndex(groupAddress);
      setVotingIndex(_votingIndex);
    }
    if (groupName !== '' && account) {
      runAsync();
    }
  }, [groupName, groupAddress, resetList, account]);

  useEffect(() => {
    if (openTooltip) {
      const timer = setTimeout(() => {
        setOpenTooltip(false);
      }, 2000);

      return () => clearTimeout(timer);
    }     
  }, [openTooltip]);

  const withdraw = async () => {
    if (!balance.isZero()) {
      try {
        await withdrawBalance(groupAddress);
      } catch (err) {
        console.log(err);
        var errorMessage = err.message.substr(0, err.message.indexOf('(')); 
        setErrorMessage(errorMessage);
      }
    } else {
      setErrorMessage('Balance must be greater than 0 to withdraw');
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(groupAddress);
    setOpenTooltip(true);
  }

  const BalanceButton = () => {
    return (
      <>
        <Chip label={'Balance: '+ethers.utils.formatEther(balance)} onClick={withdraw} clickable={true}  sx={{fontWeight: 'bold', float: 'right'}}/>
      </>
    )
  }

  const WalletCopy = () => {
    const visibleCharacters = 10;
    const visible = (visibleCharacters > 42) ? 42 :
      (visibleCharacters < 2) ? 2 : visibleCharacters; 
    const visibleFirst = Math.ceil(visible / 2);
    const visibleLast = Math.floor(visible / 2);

    const displayAddress = (
      `${groupAddress.substr(0, (visibleFirst + 2))}${visible < 42 ? '...' : ''}${groupAddress.substr(42 - visibleLast, 42)}`
    );
    return (
      <Tooltip
        PopperProps={{
          disablePortal: true,
        }}
        open={openTooltip}
        disableFocusListener
        disableHoverListener
        disableTouchListener
        title="Copied to Clipboard"
        
      >              
        <Chip label={'Wallet Address: ' + displayAddress} onClick={copyToClipboard} clickable={true} sx={{mb:4}}/>
      </Tooltip>
    )
  }

  return (
    <Box sx={{my: 10, mx:20}}>
      {groupAddress != null && 
        <>
          <Accordion expanded={expanded} onChange={() => {setExpanded(!expanded)}} sx={{p:10}}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel1bh-content"
              id={groupName + "-header"}
            >
              <Typography sx={{ width: '50%', flexShrink: 0}} variant={'h5'}>
                {groupName} - <Typography sx={{display:'inline'}}>{groupAddress}</Typography>
              </Typography>
              <Typography sx={{ color: 'text.secondary', pt: 3, width: '33%', }}>Members: {memberList.length}</Typography>
              <Chip label={'Group Id: '+groupId.toString()} sx={{fontWeight: 'bold'}}/>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container>
                <Grid xs={12} md={9}>
                  <WalletCopy></WalletCopy>
                  <Stack direction="row" spacing={2}  alignItems="center" sx={{mb:6}}>
                    <Typography variant='body1'>Voting Type:</Typography>          
                    <Typography variant='body2'>{votingTypes[votingType]}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2}  alignItems="center">
                    <Typography variant='body1'>Allocation:</Typography> 
                    <Stack direction="row" spacing={12}  alignItems="center">
                      {Object.keys(allocation).length > 0 && 
                        memberList.map((memberAddress) => {
                          return (
                            <Badge key={memberAddress} badgeContent={allocation[memberAddress].toNumber()/10000 + '%'} color="primary">
                              <Typography key={memberAddress} variant='body2' noWrap={true} sx={{maxWidth: 100}} >{memberAddress} : </Typography>
                            </Badge>
                          )
                        })
                      }
                    </Stack>
                  </Stack>
                </Grid>
                <Grid xs={12} md={3}>
                    <BalanceButton></BalanceButton>
                </Grid>
              </Grid>
              
              {expanded && 
                <>
                  <Grid container spacing={2} sx={{mt:10}}>
                    <Grid xs={10}>
                      <Badge badgeContent={votingIndex.toString()} color={'info'}>
                        <Typography sx={{ color: 'text.secondary',}} variant={'h6'}>Proposals</Typography>
                      </Badge>
                    </Grid>
                    <Grid xs={2}>
                      <CreateProposal store={store} setResetList={setResetList} currentAllocation={allocation} groupAddress={groupAddress}></CreateProposal>
                    </Grid>
                  </Grid>
                  <Stack direction={'column'} spacing={0}>
                    {!votingIndex.isZero() && 
                      new Array(votingIndex.toNumber()).fill(null).map((_, i) => i).map((voteNumber) => {
                        return (<ProposalItem key={voteNumber} groupAddress={groupAddress} voteIndex={voteNumber} store={store}></ProposalItem>)
                      })
                    }
                  </Stack>
                </>
              }
              
              
            </AccordionDetails>
          </Accordion>
          <ErrorToast errorMessage={errorMessage}></ErrorToast>
        </>
      }
      
    </Box>
  )
}