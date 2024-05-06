import * as React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import axios from "axios";
import { Alert, Avatar, Box, Button, Container, CssBaseline, Grid, Link, Snackbar, TextField, ThemeProvider, Typography, createTheme} from "@mui/material";
import { Navigate, useParams } from "react-router-dom";
import Cookies from 'js-cookie';
import { ChangeEvent } from 'react';




const EditProfile = () => {
    const [updateFlag, setUpdateFlag] = React.useState(true);
    const [error, setError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const {id} = useParams();
    const [fname, setFname] = React.useState("");
    const [lname, setLname] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [photoUrl, setPhotoUrl] = React.useState<string>("");
    const [newPassword, setNewPassword] = React.useState("");
    const [oldPassword, setOldPassword] = React.useState("");
    const [photoExists, setPhotoExists] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [snackMessage, setSnackMessage] = React.useState("")
    const [snackOpenSuccess, setSnackOpenSuccess] = React.useState(false)
    const [snackOpenFail, setSnackOpenFail] = React.useState(false)

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
        getUserInfo()
    }, [updateFlag])

    const getUserInfo = () => {
        if (! id?.match(/^\d+$/)) {
            setError(true);
            setErrorMessage("404 Not Found");
        } else {
            axios.get(`http://localhost:4941/api/v1/users/${id}/`, {headers: {'X-Authorization': Cookies.get("X-Authorization")}})
            .then((response) => {
                setFname(response.data.firstName);
                setLname(response.data.lastName);
                setEmail(response.data.email);
                if (response.data.email === undefined) {
                    setError(true)
                    setErrorMessage("403 Forbidden")
                }
                setPhotoUrl('http://localhost:4941/api/v1/users/' + id +'/image')

            }, (error) => {
                setError(true);
                setErrorMessage(error.statusText)
            })

            
            console.log(`http://localhost:4941/api/v1/users/${id}/image`);
            axios.get(`http://localhost:4941/api/v1/users/${id}/image`)
                .then((response) => {
                    console.log(response.status)
                    if (response.status === 404) {
                        setPhotoExists(false);
                    } else {
                        setPhotoExists(true);
                    }
                }, (error) => {
                    setPhotoExists(false);
                })
        }
    }

    const editUserInfo = () => {
        if (selectedFile !== null) {
            axios.put(`http://localhost:4941/api/v1/users/${id}/image`, selectedFile, {headers: {'X-Authorization': Cookies.get("X-Authorization"), "Content-Type": selectedFile.type}})
                .then((res) => {
                    setSelectedFile(null);
                    setSnackOpenFail(false)
                    setSnackOpenSuccess(true)
                    setSnackMessage("Successfully updated user")
                    setPhotoExists(true)
                }, (error) => {
                    setSnackMessage(error.response.statusText)
                    setSnackOpenFail(true)
                })
        } 
        
        axios.patch(`http://localhost:4941/api/v1/users/${id}`, {"email": email, "firstName": fname, "lastName": lname}, {headers: {'X-Authorization': Cookies.get("X-Authorization")}})
            .then((res) => {
                setSnackOpenFail(false)
                setSnackOpenSuccess(true)
                setPhotoExists(false)
                setSnackMessage("Successfully updated user")
            }, (error) => {
                setSnackMessage(error.response.statusText)
                setSnackOpenFail(true)
            })
        
    }

    const deleteImage = () => {
        axios.delete(`http://localhost:4941/api/v1/users/${id}/image`, {headers: {'X-Authorization': Cookies.get("X-Authorization")}})
            .then((response) => {
                setPhotoExists(false)
            }, (error) => {
                setError(true)
                setErrorMessage("Failed to delete image")
            })
    }

    const DisplayImage = () => {
        if (photoExists) {
            return (
                <div>
                    <img src={photoUrl}></img>
                    <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={() => { deleteImage() }}
                    >
                        Delete Image
                    </Button>
                </div>
                
            )
        } else {
            return (
                <TextField
                fullWidth
                color="secondary"
                type="file"
                onChange={handleFileChange}/>
            )
        }
        
    }
    
    if (error) {
        return (
            <div>
                <h1>Error</h1>
                {errorMessage}
            </div>
        )
    } else {
        return (
            <div>
                <h1>Edit Your Profile</h1>
                <Container component="main" maxWidth="xs">
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
                                name="newPassword"
                                label="New Password"
                                type="password"
                                id="newPassword"
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                required
                                fullWidth
                                name="oldPassword"
                                label="Old Password"
                                type="password"
                                id="oldPassword"
                                autoComplete="old-password"
                                value={oldPassword}
                                onChange={(event) => setOldPassword(event.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <DisplayImage />
                            </Grid>
                        </Grid>
                        <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={() => { editUserInfo() }}
                        >
                            Edit
                        </Button>
                        
                    </Box>
                </Container>
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


export default EditProfile;