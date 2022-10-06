import {Avatar, Box, Button, Chip, Grid, IconButton, InputAdornment, InputLabel, List, ListItem, OutlinedInput, Paper, Skeleton, Stack, TextField, Typography} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Link } from "react-router-dom";
import FlyingSquares from '../assets/flying-squares.gif';
import Constellation from '../assets/constellation.gif';
import PolygonLogo from '../assets/polygon-logo.png';
import { VisibilityOff, Visibility } from '@mui/icons-material';

export default function Instructions({store}) {

  return (
    <Grid container>
      <Grid item xs={12}>
        <Box sx={{mt:10, textAlign: 'center'}}>
          <Typography variant='h3' color={'textPrimary'}>Start your crypto partnership</Typography>
        </Box>
      </Grid>
      <Grid item xs={12} sx={{mt:100}}>
        <Stack direction={'column'} spacing={70}>
          <Box>
            <Typography variant={'h6'} color={'textPrimary'} sx={{textAlign: 'center'}}>1) Create Association</Typography>
            <Paper elevation={2} sx={{maxWidth: 250, p:10, mt:10, mx:'auto'}}>
              <TextField id="filled-basic" label="Group Name" variant="outlined" disabled fullWidth />
              <Skeleton animation="wave" variant="rounded" width={100} height={35} sx={{mt:5}}/>
            </Paper>
          </Box>
          <Box>
            <Typography variant={'h6'} color={'textPrimary'} sx={{textAlign: 'center'}}>2) Add Members</Typography>
            <Paper elevation={2} sx={{maxWidth: 250, p:10, mt:10, mx:'auto'}}>
              <IconButton color="primary" aria-label="add allocation row" disabled sx={{ml:"auto", display:'block',color: "text.primary", py:0}}>
                <AddIcon />
              </IconButton>
              <Skeleton animation="pulse"/>
              <Skeleton animation="pulse" />
              <Skeleton animation="pulse" />
              <Skeleton animation="wave" variant="rounded" width={100} height={35} sx={{mt:5}}/>
            </Paper>
          </Box>
          <Box>
            <Typography variant={'h6'} color={'textPrimary'} sx={{textAlign: 'center'}}>3) Fund</Typography>
            <Paper elevation={2} sx={{maxWidth: 250, p:10, mt:10, mx:'auto'}}>
              <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type={'text'}
                disabled
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      disabled
                      edge="end"
                    >
                      <Avatar alt={'polygonAvatar'}  src={PolygonLogo} sx={{width: 24, height: 24, left: 0, display: '-webkit-flex'}}/>
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
              />
              <Skeleton animation="wave" variant="rounded" width={100} height={35} sx={{mt:10}}/>
            </Paper>
          </Box>
          <Box sx={{pb:25}}>
            <Typography variant={'h6'} color={'textPrimary'} sx={{textAlign: 'center'}}>4) Withdraw!</Typography>
            <Paper elevation={2} sx={{maxWidth: 250, p:10, mt:10, mx:'auto'}}>
              <Chip
                avatar={<Avatar alt={'polygonAvatar'} src={PolygonLogo} sx={{left: 0, display: '-webkit-flex'}}/>}
                label={'100.532'}
                variant="filled"
                sx={{justifyContent: 'left', ml:80}}
              />  
              <Skeleton animation="wave" variant="rounded" width={100} height={35} sx={{mt:10}}/>
            </Paper>
          </Box>
        </Stack>
      </Grid>
    </Grid>
  )
}