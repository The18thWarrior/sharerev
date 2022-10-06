import { Popper,ClickAwayListener, Fade, Avatar, Chip, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useEthers } from '@usedapp/core';
import PolygonLogo from '../assets/polygon-logo.png';
import EthereumLogo from '../assets/ethereum-logo.png';
import HardhatLogo from '../assets/hardhat-logo.png';

const networkList = {
  80001 : {img: PolygonLogo, name: 'Polygon Mumbai'},
  31337 : {img: HardhatLogo, name: 'Localhost'}, 
  5 : {img: EthereumLogo, name: 'Ethereum Goreli'}
};

export default function NetworkSelect () {
  const { switchNetwork, chainId, account } = useEthers();
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event: any) => {
    if (event) {
      setAnchorEl(anchorEl ? null : event.currentTarget);
    } else {
      setAnchorEl(null);
    }      
  };


  const open = Boolean(anchorEl);
  
  return (
    <>
      {account && chainId && 
        <ClickAwayListener onClickAway={() => handleClick(null)}>
          <div onClick={e => handleClick(e)} >
            <Chip
              onClick={e => handleClick(e)}
              avatar={<Avatar alt={networkList[Number(chainId)].name} src={networkList[Number(chainId)].img} sx={{left: 0, display: '-webkit-flex'}}/>}
              label={networkList[Number(chainId)].name}
              variant="filled"
              sx={{justifyContent: 'left'}}
            />
            
              <Popper open={open} anchorEl={anchorEl} transition sx={{p:4, pb:12}} >
                  {({ TransitionProps }) => (
                      <Fade {...TransitionProps} timeout={200}>
                          <div className="network-tooltip">
                            <Stack direction={'column'} spacing={2}>
                              {Object.keys(networkList).map((key, index) => {
                                const isSame = Number(key) === Number(chainId);
                                return (
                                  <>
                                    {!isSame && 
                                      <Chip
                                        key={index} onClick={() => account && switchNetwork(Number(key))}
                                        avatar={<Avatar alt={networkList[key].name} src={networkList[key].img} sx={{left: 0, display: '-webkit-flex'}}/>}
                                        label={networkList[key].name}
                                        variant="filled"
                                        sx={{justifyContent: 'left'}}
                                      />  
                                    }
                                  </>
                                  
                                )
                              })}
                            </Stack>
                          </div>
                      </Fade>
                  )}
              </Popper>
          </div>
        </ClickAwayListener>
      }
    </>
      
  );
}