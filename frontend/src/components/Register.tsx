import { Alert, Avatar, Box, Button, Container, CssBaseline, Grid, IconButton, InputAdornment, Link, Snackbar, TextField, ThemeProvider, Typography, createTheme, styled} from "@mui/material";
import axios from "axios";
import React, { ChangeEvent } from "react";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import UploadIcon from '@mui/icons-material/Upload';
import { Navigate, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NavBar from "./NavBar";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const Register = () => {
    const [updateFlag, setUpdateFlag] = React.useState(1);
    const [fname, setFname] = React.useState("");
    const [lname, setLname] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [showPassword, setShowPassword] = React.useState<boolean>(false);
    const [snackMessage, setSnackMessage] = React.useState("")
    const [snackOpenSuccess, setSnackOpenSuccess] = React.useState(false)
    const [snackOpenFail, setSnackOpenFail] = React.useState(false)
    const [response, setResponse] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const navigate = useNavigate();

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
            setUpdateFlag(updateFlag * -1)
        }
    };

    React.useEffect(() => {

    }, [updateFlag])

    const handleClickShowPassword = () => setShowPassword((prev: any) => !prev);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const parseUser = () => {
        if (fname === "" || lname === "" || password === "" || email === "") {
            setSnackMessage("Please input all required fields")
            setSnackOpenFail(true)
        } else if (password.length < 6) {
            setSnackMessage("Password must be at least 6 characters long")
            setSnackOpenFail(true)
        } else {
            if (selectedFile !== null) {
                if (!["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(selectedFile.type)) {
                    setSnackMessage("Invalid file type, must be jpg, png or gif")
                    setSnackOpenFail(true)
                    return
                }
            }

            axios.post('http://localhost:4941/api/v1/users/register', { "firstName": fname, "lastName": lname, "email": email, "password": password})
                .then(() => {
                    setSnackOpenFail(false)
                    setSnackOpenSuccess(false)

                    axios.post('http://localhost:4941/api/v1/users/login', { "email": email, "password": password})
                    .then((response) => {
                        setUpdateFlag(updateFlag * -1);
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
                            

                            axios.put(`http://localhost:4941/api/v1/users/${Cookies.get('userId')}/image`, selectedFile, {headers: {'X-Authorization': Cookies.get("X-Authorization"), "Content-Type": selectedFile.type}})
                                .then((res) => {
                                    setSelectedFile(null);
                                    setSnackOpenFail(false)
                                    setSnackOpenSuccess(false)
                                    navigate(`/home`)
                                    window.location.reload()
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

    const displayImageUpload = () => {
        if (selectedFile === null) {
            return (
                <Button
                    fullWidth
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                >
                    Upload file
                    <VisuallyHiddenInput type="file" onChange={handleFileChange}/>
                </Button>
            )
        } else {
            return (
                <div>
                    <img src={URL.createObjectURL(selectedFile) || ""} width={250} height={250} style={{ borderRadius: '50%' }} alt='Hero'></img>
                    <Button
                        fullWidth
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                    >
                        Upload file
                        <VisuallyHiddenInput type="file" onChange={handleFileChange}/>
                    </Button>
                </div>
            )
        }
    }

    const defaultTheme = createTheme();
    if (response) {
        return (<Navigate to = {{ pathname: "/home" }} />)
    } else if (checkValidSession()) {
        return (<Navigate to = {{ pathname: "/home" }} />)
    } else {
        return (
            <div>
                <NavBar></NavBar>
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
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                </Grid>
                                <Grid item xs={12}>
                                    {displayImageUpload()}
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
                    key={"Success"}>
                    <Alert onClose={handleSnackCloseSuccess} severity="success" sx={{width: '100%'}}>
                        {snackMessage}
                    </Alert>
                </Snackbar>
                <Snackbar
                    autoHideDuration={6000}
                    open={snackOpenFail}
                    onClose={handleSnackCloseFail}
                    key={"Failure"}>
                    <Alert onClose={handleSnackCloseFail} severity="error" sx={{width: '100%'}}>
                        {snackMessage}
                    </Alert>
                </Snackbar>
            </div>
        )
    }
}

export default Register;