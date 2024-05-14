import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import PollIcon from '@mui/icons-material/Poll';
import SearchIcon from '@mui/icons-material/Search';
import { Link, Navigate } from "react-router-dom";
import { alpha, styled } from '@mui/material/styles';
import { Autocomplete, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputBase, TextField } from '@mui/material';
import axios from 'axios';
import {useSearchStore} from "../store";
import {useUserStore} from "../store/user";
import Cookies from 'js-cookie';

const pages = [{ title: "Petitions", link: "../petitions"}];

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 1),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 1),
  },
  marginLeft: 0,
  marginRight: '20px',
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

function NavBar() {
  const search = useSearchStore(state => state.search)
  const setSearch = useSearchStore(state => state.setSearch)
  const setUserId = useUserStore(state => state.setUser)
  const userId = useUserStore(state => state.id)
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [suggestedPetitions, setSuggestedPetitions] = React.useState<petitionReturn>({petitions: [], count: 0});
  const [redirect, setRedirect] = React.useState(false);
  const [signInStatus, setSignInStatus] = React.useState(false);
  const [navProfile, setNavProfile] = React.useState(false);
  const [logOut, setLogOut] = React.useState(false);
  const [logOutModal, setLogOutModal] = React.useState(false)

  React.useEffect(() => {
    
  }, [logOut])

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const searchPetitions = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    setRedirect(true);
  }

  const signIn = () => {
    setSignInStatus(true);
  }

  const updateNavProfile = () => {
    setNavProfile(true)
  }

  const handleOpenLogOutModal = () => {
    setLogOutModal(true);
  }

  const handleCloseLogOutModal = () => {
    setLogOutModal(false);
  }

  const handleLogOutModalAgree = () => {
    setLogOutModal(false);
    setLogOut(true);
    setUserId("0")
    Cookies.remove('X-Authorization');
  }

  const handleLogOutModalDisagree = () => {
    setLogOutModal(false);
    setLogOut(false)
  }

  const userInfo = () => {
    if (userId === "0") {
      return (
          <Box>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={signIn}
            >
                Sign In
            </Button>
          </Box>
      );
    } else {
      return(
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src={'http://localhost:4941/api/v1/users/' + userId +'/image'} />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem key={'Profile'} onClick={updateNavProfile}>
                <Typography textAlign="center">Profile</Typography>
              </MenuItem>
              <MenuItem key={'Logout'} onClick={handleOpenLogOutModal}>
                <Typography textAlign="center">LogOut</Typography>
              </MenuItem>
            </Menu>
          </Box>
      )
    }
  }
  if (userId === "0" && (window.location.pathname.includes('users'))) {
    return (<Navigate to = {{ pathname: "/home" }} />)
  }

  if (navProfile && (window.location.pathname !== `/users/${userId}`)) {
    return (<Navigate to = {{ pathname: `/users/${userId}` }} />)
  }

  if (signInStatus) {
    return (<Navigate to = {{ pathname: "/users/login" }} />)
  }
  else if (redirect && window.location.pathname !== "/petitions") {
    return (<Navigate to = {{ pathname: "/petitions" }} />)
  } else {
    return (
      <AppBar position="static" sx={{bgcolor: 'black'}}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <PollIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              Catalyst
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page.title} onClick={handleCloseNavMenu} component={Link} to={page.link}>
                    <Typography textAlign="center">{page.title}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <PollIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              Catalyst
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page.title}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                  component={Link} to={page.link}
                >
                  {page.title}
                </Button>
              ))}
            </Box>
            <Box>
              <form onSubmit={searchPetitions}>
                <Search>
                  <SearchIconWrapper>
                    <SearchIcon sx={{ color: 'black'}} />
                  </SearchIconWrapper>
                  <StyledInputBase
                    placeholder="Search Petitions"
                    inputProps={{ 'aria-label': 'search' }}
                    sx={{ color: 'black'}}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </Search>
              </ form>
            </Box>
            {/* <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="Remy Sharp" src={'http://localhost:4941/api/v1/users/' + userId +'/image'} />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting} onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box> */}
            {userInfo()}
          </Toolbar>
        </Container>
        <Dialog
        open={logOutModal}
        onClose={handleCloseLogOutModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Log Out?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to log out?</DialogContentText>
          <Button onClick={handleLogOutModalDisagree}>Cancel</Button>
          <Button onClick={handleLogOutModalAgree} autoFocus>
            Log Out
          </Button>
        </DialogContent>
      </Dialog>
      </AppBar>
    );}
}
export default NavBar;