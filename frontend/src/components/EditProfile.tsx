import * as React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import axios from "axios";
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import DeleteIcon from '@mui/icons-material/Delete';
import { Alert, Avatar, Box, Button, Card, Container, CssBaseline, Grid, Link, Snackbar, TextField, ThemeProvider, Typography, createTheme, styled} from "@mui/material";
import { Navigate, useParams } from "react-router-dom";
import Cookies from 'js-cookie';
import { ChangeEvent } from 'react';
import NavBar from './NavBar';

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
    const [deletePhoto, setDeletePhoto] = React.useState(false);

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
          setDeletePhoto(false)
        }
    };

    React.useEffect(() => {
        getUserInfo()
    }, [updateFlag])

    React.useEffect(() => {

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

            
            axios.get(`http://localhost:4941/api/v1/users/${id}/image`)
                .then((response) => {
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

        if (email === "" || fname === "" || lname === "") {
            setSnackMessage("Please ensure First name, Last name and email are populated")
            setSnackOpenFail(true)
            return
        }

        if (oldPassword !== "" && newPassword === "") {
            setSnackMessage("To change password you must supply both new and old passwords")
            setSnackOpenFail(true)
            return
        }

        if (oldPassword == "" && newPassword !== "") {
            setSnackMessage("To change password you must supply both new and old passwords")
            setSnackOpenFail(true)
            return
        }

        if (newPassword !== "" && newPassword.length < 6) {
            setSnackMessage("Your password must be atleast 6 characters long")
            setSnackOpenFail(true)
            return
        }

        if (deletePhoto) {
            deleteImage()
            window.location.reload()
        }

        if (selectedFile !== null) {
            if (selectedFile === null || !(["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(selectedFile.type))) {
                setSnackMessage("Please upload a file of type jpg, png of gif")
                setSnackOpenFail(true)
                return
            }

            axios.put(`http://localhost:4941/api/v1/users/${id}/image`, selectedFile, {headers: {'X-Authorization': Cookies.get("X-Authorization"), "Content-Type": selectedFile.type}})
                .then((res) => {
                    setSelectedFile(null);
                    setSnackOpenFail(false)
                    setSnackOpenSuccess(true)
                    setSnackMessage("Successfully updated user")
                    setPhotoExists(true)
                    window.location.reload()
                }, (error) => {
                    setSnackMessage(error.response.statusText)
                    setSnackOpenFail(true)
                })
        } 

        let body = {}
        if (oldPassword !== "" && newPassword !== "") {
            body = {"email": email, "firstName": fname, "lastName": lname, "password": newPassword, "currentPassword": oldPassword}
        } else {
            body = {"email": email, "firstName": fname, "lastName": lname}
        }
        
        axios.patch(`http://localhost:4941/api/v1/users/${id}`, body, {headers: {'X-Authorization': Cookies.get("X-Authorization")}})
            .then((res) => {
                setSnackOpenFail(false)
                setSnackOpenSuccess(true)
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

    const handleCancel = () => {
        setSelectedFile(null)
        setUpdateFlag(prev => !prev)
    }

    const handleRemoveImage = () => {
        setSelectedFile(null)
        setPhotoExists(false)
        setDeletePhoto(true)
    }

    const displayImage = () => {
        if (photoExists === true) {
            return (
                <div>
                    <img src={`http://localhost:4941/api/v1/users/${id}/image` || ""} width="80%" style={{ borderRadius: '5px' }}></img>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<DeleteIcon />}
                        onClick={handleRemoveImage}
                        sx={{ marginTop: "10px"}}
                    >
                        Remove Image
                    </Button>
                </div>
            )
        } else if (selectedFile === null) {
            return (
                <div>
                    <Box
                        sx={{
                            width: '80%',
                            paddingTop: '60%', // 1:1 aspect ratio
                            position: 'relative',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '75%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Button
                                component="label"
                                role={undefined}
                                variant="text"
                                tabIndex={-1}
                                startIcon={<InsertPhotoIcon />}
                            >
                                Upload Petition Image
                                <VisuallyHiddenInput type="file" onChange={handleFileChange}/>
                            </Button>
                        </Box>
                    </Box>
                </div>
            )
        } else {
            return (
                <div>
                    <img src={URL.createObjectURL(selectedFile) || ""} width="80%" style={{ borderRadius: '5px' }}></img>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<DeleteIcon />}
                        onClick={handleRemoveImage}
                        sx={{ marginTop: "10px"}}
                    >
                        Remove Image
                    </Button>
                </div>
            )
        }
    }

    const displaySnack = () => {
        return (
            <div>
                <Snackbar
                    autoHideDuration={6000}
                    open={snackOpenSuccess}
                    onClose={handleSnackCloseSuccess}
                    >
                    <Alert onClose={handleSnackCloseSuccess} severity="success" sx={{width: '100%'}}>
                        {snackMessage}
                    </Alert>
                </Snackbar>
                <Snackbar
                    autoHideDuration={6000}
                    open={snackOpenFail}
                    onClose={handleSnackCloseFail}
                    >
                    <Alert onClose={handleSnackCloseFail} severity="error" sx={{width: '100%'}}>
                        {snackMessage}
                    </Alert>
                </Snackbar>
            </div>
        )
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
                <NavBar></NavBar>
                <Container>
                    <Card sx={{marginTop: "50px", padding: "20px"}}>
                        <Typography variant="h2">
                            Edit User Profile
                        </Typography>
                        <Grid container spacing={2} sx={{ paddingBottom: "50px", paddingTop: "20px"}}>
                            <Grid item xs={12} sm={6} md={6}>
                                {displayImage()}
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <Box sx={{paddingBottom: "20px", padding: "20px"}}>
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
                                        sx={{ marginBottom: "20px" }}
                                    /> 
                                    <TextField
                                        required
                                        fullWidth
                                        id="lastName"
                                        label="Last Name"
                                        name="lastName"
                                        autoComplete="family-name"
                                        value={lname} 
                                        onChange={(event) => setLname(event.target.value)}
                                        sx={{ marginBottom: "20px" }}
                                    />
                                    <TextField
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        name="email"
                                        autoComplete="email"
                                        value={email} 
                                        onChange={(event) => setEmail(event.target.value)}
                                        sx={{ marginBottom: "20px" }}
                                    />
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
                                        sx={{ marginBottom: "20px" }}
                                    />
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
                                        sx={{ marginBottom: "20px" }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            variant="outlined"
                            sx={{ mt: 3, mb: 2 }}
                            onClick={() => { (handleCancel()) }}
                            style={{ width: "20%", margin: "10px" }}
                        >
                            Revert
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            onClick={() => { editUserInfo() }}
                            style={{ width: "20%", margin: "10px" }}
                        >
                            Submit
                        </Button>
                    </Card>
                </Container>
                {displaySnack()}
            </div>
        )
    }
    
}


export default EditProfile;