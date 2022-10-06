import {Box, Button, Container, Typography} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { Link } from "react-router-dom";
import { useEthers } from '@usedapp/core';
import Instructions from '../components/Instructions';
import FlyingSquares from '../assets/flying-squares-transparent.gif';
import Constellation from '../assets/constellation-transparent.gif';

export default function LandingPage({store}) {
  const { account } = useEthers();
  return (
    <Grid container>
      <Grid xs={4}>
        <img src={FlyingSquares} alt={'constellation gif'} style={{maxWidth: 400, marginLeft: '10vw'}}/>
      </Grid>
      <Grid xs={8}>
        {account && 
          <Grid display="flex" justifyContent="center" alignItems="center" sx={{minHeight: '50vh'}}>            
              <Button component={Link} to={'/dashboard'} variant="contained" sx={{textTransform:'none'}}>Dashboard</Button>
          </Grid>
        }        
      </Grid>
      <Grid xs={12}>
        <Instructions store={store}></Instructions>
      </Grid>
    </Grid>
  )
}