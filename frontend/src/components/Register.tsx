import { Alert, Avatar, Box, Button, Container, CssBaseline, Grid, Link, Snackbar, TextField, ThemeProvider, Typography, createTheme} from "@mui/material";
import axios from "axios";
import React, { ChangeEvent } from "react";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import UploadIcon from '@mui/icons-material/Upload';
import { Navigate } from "react-router-dom";
import Cookies from 'js-cookie';

const Register = () => {
    const [updateFlag, setUpdateFlag] = React.useState(true);
    const [fname, setFname] = React.useState("");
    const [lname, setLname] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [snackMessage, setSnackMessage] = React.useState("")
    const [snackOpenSuccess, setSnackOpenSuccess] = React.useState(false)
    const [snackOpenFail, setSnackOpenFail] = React.useState(false)
    const [response, setResponse] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

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

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
          setSelectedFile(event.target.files[0]);
        }
    };

    React.useEffect(() => {

    }, [updateFlag])

    const parseUser = () => {
        if (fname === "" || lname === "" || password === "" || email === "") {
            alert("Please input all fields!")
        } else if (password.length < 6) {
            alert("Password must be at least 6 characters long")
        } else {
            axios.post('http://localhost:4941/api/v1/users/register', { "firstName": fname, "lastName": lname, "email": email, "password": password})
                .then(() => {
                    setSnackOpenFail(false)
                    setSnackOpenSuccess(false)

                    axios.post('http://localhost:4941/api/v1/users/login', { "email": email, "password": password})
                    .then((response) => {
                        setUpdateFlag(true);
                        setFname("");
                        setLname("");
                        setEmail("");
                        setPassword("");
                        
                        setSnackOpenFail(false)
                        setSnackOpenSuccess(false)
                        Cookies.set('X-Authorization', response.data.token);
                        Cookies.set('userId', response.data.userId);
                        setResponse(true)

                        if (selectedFile !== null) {
                            console.log("Photo found");
                            axios.put(`http://localhost:4941/api/v1/users/${Cookies.get('userId')}/image`, {selectedFile}, {headers: {'X-Authorization': Cookies.get("X-Authorization"), "Content-Type": "image/jpeg"}})
                                .then((res) => {
                                    console.log("Request sent");
                                    console.log(res)
                                    setSelectedFile(null);
                                    setSnackOpenFail(false)
                                    setSnackOpenSuccess(false)
                                }, (error) => {
                                    setSnackMessage(error.response.statusText)
                                    setSnackOpenFail(true)
                                })
                        }

                    }, (error) => {
                        setSnackMessage(error.response.statusText)
                        setSnackOpenFail(true)
                    })

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

    const defaultTheme = createTheme();
    if (response) {
        return (<Navigate to = {{ pathname: "/home" }} />)
    } else if (checkValidSession()) {
        return (<Navigate to = {{ pathname: "/home" }} />)
    } else {
        return (
            <div>
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
                            Sign up
                        </Typography>
                        <Box sx={{ mt: 3 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                    autoComplete="given-name"
                                    name="firstName"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    autoFocus
                                    value={fname} 
                                    onChange={(event) => setFname(event.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Last Name"
                                    name="lastName"
                                    autoComplete="family-name"
                                    value={lname} 
                                    onChange={(event) => setLname(event.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    value={email} 
                                    onChange={(event) => setEmail(event.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                        <TextField
                                        fullWidth
                                        color="secondary"
                                        type="file" 
                                        onChange={handleFileChange}/>
                                </Grid>
                            </Grid>
                                <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                onClick={() => { parseUser() }}
                                >
                                    Sign Up
                                </Button>
                            <Grid container justifyContent="flex-end">
                                <Grid item>
                                    <Link href="/users/login" variant="body2">
                                        Already have an account? Sign in
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                        </Box>
                    </Container>
                    </ThemeProvider>
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
            </div>
        )
    }
}

export default Register;