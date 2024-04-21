import { Alert, AlertTitle, Autocomplete, Avatar, Box, Button, Chip, Container, CssBaseline, FormControl, Grid, InputLabel, Link, MenuItem, Modal, OutlinedInput, Select, SelectChangeEvent, Snackbar, TextField, Theme, ThemeProvider, Typography, createTheme, useTheme} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from "axios";
import { Dayjs } from "dayjs";
import React from "react";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Navigate } from "react-router-dom";

const POS_TAG_HEIGHT = 48;
const POS_TAG_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: POS_TAG_HEIGHT * 4.5 + POS_TAG_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name: string, personName: readonly string[], theme: Theme) {
    return {
      fontWeight:
        personName.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
}

const Register = () => {
    const theme = useTheme();
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [updateFlag, setUpdateFlag] = React.useState(true);
    const [fname, setFname] = React.useState("");
    const [lname, setLname] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [dob, setDOB] = React.useState<Dayjs | null>();
    const [gender, setGender] = React.useState<string|null>();
    const [height, setHeight] = React.useState<number|null>();
    const [weight, setWeight] = React.useState<number|null>();
    const [positions, setPositions] = React.useState<string[]>([]);
    const [role, setRole] = React.useState("");
    const [club, setClub] = React.useState<string | null>("");
    const [openModal, setOpenModal] = React.useState(false);
    const [snackMessage, setSnackMessage] = React.useState("")
    const [snackOpenSuccess, setSnackOpenSuccess] = React.useState(false)
    const [snackOpenFail, setSnackOpenFail] = React.useState(false)
    const [allClubs, setAllClubs] = React.useState<string[]>([]);
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

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    React.useEffect(() => {
        const getUsers = () => {
            
        }
        getUsers()
    }, [updateFlag])

    const parseUser = () => {
        if (fname === "" || lname === "" || password === "" || email === "") {
            alert("Please input all fields!")
        } else if (password.length < 6) {
            alert("Password must be at least 6 characters long")
        } else {
            axios.post('http://localhost:4941/api/v1/users/register', { "firstName": fname, "lastName": lname, "email": email, "password": password})
                .then(() => {
                    setUpdateFlag(true);
                    setFname("");
                    setLname("");
                    setEmail("");
                    setPassword("");

                    
                    setSnackOpenFail(false)
                    setSnackMessage("User added successfully")
                    setSnackOpenSuccess(true)
                    setResponse(true)
                }, (error) => {
                    setSnackMessage(error.response.statusText)
                    setSnackOpenFail(true)
                })
        }
    }

    // const input = {
    //     margin: '5px',
    //     padding: '5px'
    // }

    const defaultTheme = createTheme();
    if (response) {
        return (<Navigate to = {{ pathname: "/users/login" }} />)
    } else if (errorFlag) {
        return (
            <div>
                <h1>Users</h1>
                {errorFlag &&
                    <Alert severity="error">
                        <AlertTitle>Error</AlertTitle>
                        {errorMessage}
                    </Alert>
                }
            </div>
        )
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