import { useEffect, useState } from 'react';
import { useEthers } from '@usedapp/core';
import {Box} from '@mui/material';
import GroupItem from './GroupItem';

import {getGroupContract} from '../static/blockchain';
import {getMembershipList} from '../static/api';
import { makeId } from '../static/utility';

export default function GroupList({store, resetList}) {
  const {account, chainId, error} = useEthers();
  const [groupIdList, setGroupIdList] = useState([]);
  const [groupList, setGroupList] = useState([]);

  
  
  useEffect(() => {    
    const getGroupData = async () => {
      try {
        const newGroupList = await groupIdList.map(async (value) => {
          return await getGroupContract(value);        
        });
        const results = await Promise.allSettled(newGroupList);
        //const typeFix = await Promise.all(results);
        const _groupList = results.map((val) => {
          return val['value'];
        });
        //console.log(_groupList);
        setGroupList(_groupList);
      } catch (err) {
        console.log(err);
      }
      
    };

    if (groupIdList.length > 0 && account) {
      getGroupData();
    } else {
      setGroupList([])
    }

    if (error) {
      const errorData = JSON.parse(error.message);
      if (errorData.code === 1013) {
        setTimeout(() => {
          if (groupIdList.length > 0 && account) {
            getGroupData();
          }
        }, 1000)
      }
    }
    
  }, [groupIdList, account, error]);

  useEffect(() => {
    const runAsync = async () => {
      try {
        const membershipList = await getMembershipList(account, chainId);
        //console.log(membershipList)
        setGroupIdList(membershipList.map((val) => {
          return val.groupId;
        }))
        //console.log(account, membershipList);
      } catch (err) {
        console.log(err);
      }
    }
    //console.log(account);
    if (account) {
      runAsync();
    } else {
      setGroupIdList([])
    }
    
  }, [account, chainId, resetList])


  return (
    <Box sx={{my: 10, mx:20}}>
      {
        groupList.map((group) => {
          return <GroupItem store={store} groupAddress={group} key={makeId(5)}></GroupItem>
        })
      }
    </Box>
  )
}