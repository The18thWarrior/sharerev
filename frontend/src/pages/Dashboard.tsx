
import {Box, IconButton} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useState } from 'react';
import CreateGroup from "../components/CreateGroup";
import GroupList from '../components/GroupList';
import { makeId } from '../static/utility';

export default function DashboardPage({store}) {
  const [resetList, setResetList] = useState('');
  return (
    <Box sx={{my: 10, mx:20}}>
      <Grid container>
        <Grid xs={8}>
        </Grid>
        <Grid xs={1}></Grid>
        <Grid xs={2}>
          <CreateGroup store={store} setResetList={setResetList}></CreateGroup>
        </Grid>     
        <Grid xs={1}>
          <IconButton aria-label="refresh" onClick={() => {setResetList(makeId(5))}}>
            <RefreshIcon />
          </IconButton>
        </Grid>  
      </Grid>
      <Box>
        <GroupList store={store} resetList={resetList}></GroupList>
      </Box> 
    </Box>
  )
}