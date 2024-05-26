import * as React from 'react';
import axios from "axios";
import { Box, Button, Card, Container, Grid, Typography} from "@mui/material";
import { Navigate, useParams } from "react-router-dom";
import Cookies from 'js-cookie';
import NavBar from './NavBar';
import EditIcon from '@mui/icons-material/Edit';
import NotFound from './NotFound';


const UserProfile = () => {
    const [error, setError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const {id} = useParams();
    const [fname, setFname] = React.useState("");
    const [lname, setLname] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [photoUrl, setPhotoUrl] = React.useState<string>("");
    const [edit, setEdit] = React.useState(false);


    React.useEffect(() => {
        getUserInfo()
    })

    React.useEffect(() => {
    }, [error, edit])

    const displayImage = () =>{
        return (
            <img src={ photoUrl || `https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png`} alt='UserProfile' style={{ width: "80%", borderRadius: "10px" }} ></img>
        )
    }

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

                axios.get(`http://localhost:4941/api/v1/users/${id}/image`)
                .then((response) => {
                    setPhotoUrl("")
                    setPhotoUrl('http://localhost:4941/api/v1/users/' + id +'/image')
                }, (error) => {
                    setPhotoUrl("")
                })

            }, (error) => {
                setError(true);
                setErrorMessage(error.statusText)
            })
        }
        
    }

    const handleEdit = () => {
        setEdit(true);
    }

    if (Cookies.get("userId") === undefined) {
        return (
            <NotFound></NotFound>
        )
    }
    
    if (error) {
        return (
            <div>
                <NavBar></NavBar>
                {errorMessage}
            </div>
        )
    } else if (edit) {
        return (<Navigate to = {{ pathname: "/users/" + id +"/edit" }} />)  
    } else {
        return (
            <div>
                <NavBar></NavBar>
                <Container>
                    <Card sx={{marginTop: "50px"}}>
                        <Typography variant="h2">
                            User Profile
                        </Typography>
                        <Grid container spacing={2} sx={{ paddingBottom: "50px", paddingTop: "20px"}}>
                            <Grid item xs={12} sm={6} md={6}>
                                {displayImage()}
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <Box sx={{paddingBottom: "20px"}}>
                                    <Typography variant="h3">
                                        {fname}
                                    </Typography>
                                    <Typography variant="h3">
                                        {lname}
                                    </Typography>
                                </Box>
                                <Typography variant="body1">
                                    <b>Email: </b>{email}
                                </Typography>
                                <Button
                                    component="label"
                                    role={undefined}
                                    variant="outlined"
                                    tabIndex={-1}
                                    startIcon={<EditIcon />}
                                    sx={{ margin: "20px"}}
                                    onClick={handleEdit}
                                >
                                    Edit Profile
                                </Button>
                            </Grid>
                        </Grid>
                    </Card>
                </Container>
            </div>
        )
    }
    
}


export default UserProfile;