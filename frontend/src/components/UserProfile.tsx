import * as React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import axios from "axios";
import { Alert, Avatar, Box, Button, Container, CssBaseline, Grid, Link, Snackbar, TextField, ThemeProvider, Typography, createTheme} from "@mui/material";
import { Navigate, useParams } from "react-router-dom";
import Cookies from 'js-cookie';




const UserProfile = () => {
    const [updateFlag, setUpdateFlag] = React.useState(true);
    const [error, setError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const {id} = useParams();
    const [fname, setFname] = React.useState("");
    const [lname, setLname] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [photoUrl, setPhotoUrl] = React.useState<string>("");


    React.useEffect(() => {
        getUserInfo()
    }, [])

    React.useEffect(() => {
        getUserInfo()
    }, [error])

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
                console.log(response.data.email)
                if (response.data.email === undefined) {
                    setError(true)
                    setErrorMessage("403 Forbidden")
                }
                setPhotoUrl('http://localhost:4941/api/v1/users/' + id +'/image')
                // getUserPhoto()

            }, (error) => {
                setError(true);
                setErrorMessage(error.statusText)
            })
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
                <h1>UserProfile</h1>
                <div>
                    <img src={photoUrl}></img>
                </div>
                <div>
                    Name: {fname + " " + lname}
                </div>

                <div>
                Email: {email}
                </div>
                
            </div>
        )
    }
    
}


export default UserProfile;