import Cookies from 'js-cookie';
import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import NavBar from './NavBar';
import NotFound from './NotFound';
import axios from 'axios';

interface Petition {
    petitionId: number;
    title: string;
    categoryId: number;
    ownerId: number;
    ownerFirstName: string;
    ownerLastName: string;
    numberOfSupporters: number;
    creationDate: string;
    description: string;
    moneyRaised: number;
    supportTiers: SupportTier[];
}

interface SupportTier {
    title: string;
    description: string;
    cost: number;
    supportTierId: number;
}

const EditPetition = () => {
    const {id} = useParams();
    const [petition, setPetition] = React.useState<Petition | null>(null);
    const [error, setError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");

    React.useEffect(() => {
        getPeitionInfo()
    }, [])

    const getPeitionInfo = async () => {
        if (! id?.match(/^\d+$/)) {
            setError(true);
            setErrorMessage("404 Not Found");
        } else {
            axios.get(`http://localhost:4941/api/v1/petitions/${id}/`)
            .then((response) => {
                setPetition(response.data)
            }, (error) => {
                setError(true);
                setErrorMessage(error.statusText)
            })
        }
    }

    if (Number(Cookies.get("userId")) !== petition?.ownerId) {
        return(
            <div>
                <NavBar />
                <NotFound />
            </div>
        )
    }

    if (error) {
        return (
            <div>
                {errorMessage}
            </div>
        )
    }

    return (
        <div>
            <NavBar />
            <h1>Edit Petition</h1>
        </div>
    )
}


export default EditPetition