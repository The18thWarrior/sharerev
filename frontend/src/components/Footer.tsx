import { AppBar, Box, Toolbar } from "@mui/material"
import NetworkSelect from "./NetworkSelect"
import SocialIcons from "./SocialIcons"


export default function Footer () {
  
  return (
    <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
        <Toolbar>
          <NetworkSelect/>
          <Box sx={{ flexGrow: 1 }} />
          <SocialIcons 
            discordUrl={'https://discord.gg/Ej9fMBRArr'}
            emailUrl={''}
            twitterUrl={''}
            instagramUrl={''}
            githubUrl={'https://www.github.com/the18thWarrior'}
            governanceUrl={''}
            websiteUrl={''}
            gitbookUrl={'https://www.gitbook.com'}
          />
        </Toolbar>
      </AppBar>
  )
}