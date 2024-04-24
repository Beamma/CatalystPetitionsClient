import * as React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import axios from "axios";
import { Alert, Avatar, Box, Button, Container, CssBaseline, Grid, Link, Snackbar, TextField, ThemeProvider, Typography, createTheme} from "@mui/material";
import { Navigate } from "react-router-dom";
import Cookies from 'js-cookie';



const defaultTheme = createTheme();

const Logout = () => {
    const [updateFlag, setUpdateFlag] = React.useState(true);
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
        
    }, [updateFlag])

    const handleLogOut = () => {
        axios.post('http://localhost:4941/api/v1/users/logout', {}, {headers: {'X-Authorization': Cookies.get("X-Authorization")}})
            .then(() => {
                setUpdateFlag(true);
                
                setSnackOpenFail(false)
                setSnackMessage("User successfully logged out")
                setSnackOpenSuccess(true)

                Cookies.remove('X-Authorization');
                setResponse(true)
            }, (error) => {
                setSnackMessage(error.response.statusText)
                setSnackOpenFail(true)
            })
        }
    

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
                <Box>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={() => { handleLogOut() }}
                    >
                        Sign Out
                    </Button>
                </Box>
            </Box>
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


export default Logout;