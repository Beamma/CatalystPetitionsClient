import * as React from 'react';
import axios from "axios";
import { Button} from "@mui/material";
import { Navigate, useParams } from "react-router-dom";
import Cookies from 'js-cookie';
import NavBar from './NavBar';


const UserProfile = () => {
    const [updateFlag, setUpdateFlag] = React.useState(true);
    const [error, setError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const {id} = useParams();
    const [fname, setFname] = React.useState("");
    const [lname, setLname] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [photoUrl, setPhotoUrl] = React.useState<string>("");
    const [edit, setEdit] = React.useState(false);


    React.useEffect(() => {
        
    }, [])

    React.useEffect(() => {
        getUserInfo()
    }, [error, edit])

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

    const handleEdit = () => {
        setEdit(true);
    }
    
    if (error) {
        return (
            <div>
                <h1>Error</h1>
                {errorMessage}
            </div>
        )
    } else if (edit) {
        return (<Navigate to = {{ pathname: "/users/" + id +"/edit" }} />)  
    } else {
        return (
            <div>
                <NavBar></NavBar>
                <h1>UserProfile</h1>
                <div>
                    <img src={photoUrl} width={250} height={250} style={{ borderRadius: '50%' }} alt='Hero'></img>
                </div>
                <div>
                    Name: {fname + " " + lname}
                </div>

                <div>
                    Email: {email}
                </div>

                <div>
                    <Button onClick={handleEdit}>Edit</Button>
                </div>
                
            </div>
        )
    }
    
}


export default UserProfile;