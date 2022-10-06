import { useEffect } from 'react';
import { Link  } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { AccountButton } from './AccountButton';
import LogoLight from '../assets/logo-light.png';
import LogoDark from '../assets/logo-dark.png';


function Header({store}) {
  //const {account} = useEthers();
  //const [menuType, setMenuType] = useState('');
  //const currentTheme = useTheme();
  //let navigate = useNavigate();
  //const location = useLocation();

  /*function toHome() {
    navigate("/", { replace: true });
  }*/

  useEffect(() => {
    //console.log('logolight', LogoLight);
  }, [])

  return (
    <div style={{display: 'flex'}}>
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" color="default" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, boxShadow: 'none' }}>
          <Toolbar>           
          
            <Button variant="text" component={Link} to={'/'}><img src={LogoDark} className="side-image" alt="menuLogo"/></Button>
            <Box sx={{ flexGrow: 1, textAlign: 'right'  }}>
              <AccountButton store={store}></AccountButton>
            </Box>                  
          </Toolbar>
        </AppBar>
      </Box>
    </div>
    
  );
}
// 
export default Header;