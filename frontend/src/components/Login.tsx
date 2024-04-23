import * as React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import axios from "axios";
import { Alert, Avatar, Box, Button, Container, CssBaseline, Grid, Link, Snackbar, TextField, ThemeProvider, Typography, createTheme} from "@mui/material";
import { Navigate } from "react-router-dom";
import Cookies from 'js-cookie';


function Copyright(props: any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Petitions
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

const Login = () => {
    const [updateFlag, setUpdateFlag] = React.useState(true);
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [snackMessage, setSnackMessage] = React.useState("")
    const [snackOpenSuccess, setSnackOpenSuccess] = React.useState(false)
    const [snackOpenFail, setSnackOpenFail] = React.useState(false)
    const [response, setResponse] = React.useState(false);

    const handleSnackCloseSuccess = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackOpenSuccess(false);
    };

    const handleSnackCloseFail = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackOpenFail(false);
    };

    React.useEffect(() => {
        const getUsers = () => {
        }
        getUsers()
    }, [updateFlag])

    const handleSubmit = () => {
        if (email === null || password === null || email === undefined || password === undefined || email === "" || password === "" ) {
            alert("Please input all fields!")
        } else {
            axios.post('http://localhost:4941/api/v1/users/login', { "email": email, "password": password})
                .then((response) => {
                    setUpdateFlag(true);
                    setEmail("");
                    setPassword("");
                    
                    setSnackOpenFail(false)
                    setSnackMessage("User successfully logged in")
                    setSnackOpenSuccess(true)
                    console.log(response.data.token)
                    Cookies.set('X-Authorization', response.data.token);
                    setResponse(true)
                }, (error) => {
                    setSnackMessage(error.response.statusText)
                    setSnackOpenFail(true)
                })
        }
    }

    const checkValidSession = () => {
      if (Cookies.get('X-Authorization')) {
        return true;
      }

      return false;
    }

    if (response) {
        return (<Navigate to = {{ pathname: "/home" }} />)
    } else if (checkValidSession()) {
        return (<Navigate to = {{ pathname: "/home" }} />)
    } else {
        return (
            <ThemeProvider theme={defaultTheme}>
              <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                  sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                  </Avatar>
                  <Typography component="h1" variant="h5">
                    Sign in
                  </Typography>
                  <Box>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={email} 
                      onChange={(event) => setEmail(event.target.value)}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="current-password"
                      value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    />
                    <FormControlLabel
                      control={<Checkbox value="remember" color="primary" />}
                      label="Remember me"
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                      onClick={() => { handleSubmit() }}
                    >
                      Sign In
                    </Button>
                    <Grid container>
                      {/* <Grid item xs>
                        <Link href="#" variant="body2">
                          Forgot password?
                        </Link>
                      </Grid> */}
                      <Grid item>
                        <Link href="/users/register" variant="body2">
                          {"Don't have an account? Sign Up"}
                        </Link>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
                <Copyright sx={{ mt: 8, mb: 4 }} />
                <Snackbar
                    autoHideDuration={6000}
                    open={snackOpenSuccess}
                    onClose={handleSnackCloseSuccess}
                    key={snackMessage}>
                    <Alert onClose={handleSnackCloseSuccess} severity="success" sx={{width: '100%'}}>
                        {snackMessage}
                    </Alert>
                </Snackbar>
                <Snackbar
                    autoHideDuration={6000}
                    open={snackOpenFail}
                    onClose={handleSnackCloseFail}
                    key={snackMessage}>
                    <Alert onClose={handleSnackCloseFail} severity="error" sx={{width: '100%'}}>
                        {snackMessage}
                    </Alert>
                </Snackbar>
              </Container>
            </ThemeProvider>
          );
    }
}


export default Login;