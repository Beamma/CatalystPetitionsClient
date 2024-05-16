import React from 'react';
import NavBar from './NavBar';
import { useParams } from "react-router-dom";
import axios from 'axios';
import { Alert, Avatar, Card, CardContent, CardMedia, Container, Grid, Typography } from '@mui/material';

interface SupportTier {
    title: string;
    description: string;
    cost: number;
    supportTierId: number;
}

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

const Petition = () => {
    const {id} = useParams();
    const [error, setError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [petition, setPetition] = React.useState<Petition | null>(null);
    const [ownerProfilePic, setOwnerProfilePic] = React.useState(false);

    React.useEffect(() => {
        getPeitionInfo()
    }, [])

    const getPeitionInfo = async () => {
        console.log("getPeitionInfo1")
        if (! id?.match(/^\d+$/)) {
            setError(true);
            setErrorMessage("404 Not Found");
        } else {
            await axios.get(`http://localhost:4941/api/v1/petitions/${id}/`)
            .then((response) => {
                setPetition(response.data)
            }, (error) => {
                setError(true);
                setErrorMessage(error.statusText)
            })
        }
        
    }

    // const displayPetitionInfo = () => {
    //     return (
    //         <div>
    //             {petition && (
    //             <div>
    //               <h1>{petition.title}</h1>
    //               <p>Owner: {petition.ownerFirstName} {petition.ownerLastName}</p>
    //               <img src={'http://localhost:4941/api/v1/user/' + petition.ownerId +'/image'} width={150} height={150}></img>
    //               <p>Description: {petition.description}</p>
    //               <p>Number of Supporters: {petition.numberOfSupporters}</p>
    //               <p>Creation Date: {new Date(petition.creationDate).toLocaleDateString()}</p>
    //               <p>Money Raised: ${petition.moneyRaised}</p>
    //               <h2>Support Tiers:</h2>
    //               <ul>
    //                 {petition.supportTiers.map((tier: any) => (
    //                   <li key={tier.supportTierId}>
    //                     <strong>{tier.title}</strong> - {tier.description} (Cost: ${tier.cost})
    //                   </li>
    //                 ))}
    //               </ul>
    //             </div>
    //           )}
    //         </div>
    //       );
    // }

    const displayPetitionInfo = () => {
        return (
            <Container>
              {petition && (
                <Card sx={{ marginTop: 4 }}>
                    <img src={'http://localhost:4941/api/v1/petitions/' + petition.petitionId +'/image'} width="30%"></img>
                    <CardContent>
                    <Typography variant="h4" component="h1" gutterBottom>
                      {petition.title}
                    </Typography>
                    <Typography variant="h6" component="h2">
                        <img src={'http://localhost:4941/api/v1/users/' + petition.ownerId +'/image'} width={50} height={50} style={{ borderRadius: '50%' }} alt='Hero'></img>
                        {petition.ownerFirstName} {petition.ownerLastName}
                    </Typography>
                    <Typography variant="body1">
                      Category ID: {petition.categoryId}
                    </Typography>
                    <Typography variant="body1">
                      Number of Supporters: {petition.numberOfSupporters}
                    </Typography>
                    <Typography variant="body1">
                      Created On: {new Date(petition.creationDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Description: {petition.description}
                    </Typography>
                    <Typography variant="body1">
                      Money Raised: ${petition.moneyRaised}
                    </Typography>
                    <Typography variant="h5" component="h3" gutterBottom>
                      Support Tiers
                    </Typography>
                    <Grid container spacing={2}>
                      {petition.supportTiers.map((tier) => (
                        <Grid item xs={12} sm={6} md={4} key={tier.supportTierId}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6">{tier.title}</Typography>
                              <Typography variant="body2" paragraph>
                                {tier.description}
                              </Typography>
                              <Typography variant="body2">
                                Cost: ${tier.cost}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    </CardContent>
                </Card>
              )}
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error">{errorMessage}</Alert>
            </Container>
        )
    } else {
        return (
            <div>
                <NavBar></NavBar>
                {displayPetitionInfo()}
            </div>
        )
    }
}

export default Petition;