import React from 'react';
import NavBar from './NavBar';
import { useParams } from "react-router-dom";
import axios, { AxiosResponse } from 'axios';
import { Alert, Avatar, Button, Card, CardContent, CardMedia, Container, Divider, Grid, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

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

interface Supporter {
    supportId: number;
    supportTierId: number;
    message: string;
    supporterId: number;
    supporterFirstName: string;
    supporterLastName: string;
    timestamp: string;
    supporterImageUrl?: string; // Add optional supporter image URL
}

interface SimilarPetition {
    petitionId: number;
    title: string;
    categoryId: number;
    ownerId: number;
    ownerFirstName: string;
    ownerLastName: string;
    creationDate: string;
    supportingCost: number;
}

const Petition = () => {
    const {id} = useParams();
    const [error, setError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [petition, setPetition] = React.useState<Petition | null>(null);
    const [supporters, setSupporters] = React.useState<Supporter[]>([]);
    const [showAllSupporters, setShowAllSupporters] = React.useState<boolean>(false);
    const [similarPetitions, setSimilarPetitions] = React.useState<SimilarPetition[]>([]);
    const [showAllPetitions, setShowAllPetitions] = React.useState<boolean>(false);

    React.useEffect(() => {
        getPeitionInfo()
        getSupporters()
        getSimilarPetitions()
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

    const getSupporters = async () => {
        if (! id?.match(/^\d+$/)) {
            setError(true);
            setErrorMessage("404 Not Found");
        } else {
            await axios.get(`http://localhost:4941/api/v1/petitions/${id}/supporters/`)
            .then((response) => {
                setSupporters(response.data)
            }, (error) => {
                setError(true);
                setErrorMessage(error.statusText)
            })
        }
    }

    const getSimilarPetitions = async () => {
        if (! id?.match(/^\d+$/)) {
            setError(true);
            setErrorMessage("404 Not Found");
        } else {
            axios.get(`http://localhost:4941/api/v1/petitions/`, { params: { categoryId: petition?.categoryId, count: 20 } })
            .then((response) => {
                setSimilarPetitions(response.data.petitions);
            }, (error) => {
                setError(true);
                setErrorMessage(error.statusText)
            })
        }
    }

    const getSupportTierTitle = (tierId: number) => {
        const tier = petition?.supportTiers.find(t => t.supportTierId === tierId);
        return tier ? tier.title : 'Unknown Tier';
      };

    const displaySupporters = showAllSupporters ? supporters : supporters.slice(0, 5);

    const displayPetitions = showAllPetitions ? similarPetitions : similarPetitions.slice(0, 3);

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
                    <Typography variant="h5" component="h3" gutterBottom>
                        Supporters
                        </Typography>
                        <List>
                        {displaySupporters.map((supporter) => (
                            <React.Fragment key={supporter.supportId}>
                            <ListItem alignItems="flex-start">
                                <ListItemAvatar>
                                <Avatar
                                    alt={`${supporter.supporterFirstName} ${supporter.supporterLastName}`}
                                    src={`http://localhost:4941/api/v1/users/${supporter.supporterId}/image` || '/default-profile.png'}
                                />
                                </ListItemAvatar>
                                <ListItemText
                                primary={`${supporter.supporterFirstName} ${supporter.supporterLastName}`}
                                secondary={
                                    <>
                                    <Typography
                                        sx={{ display: 'inline' }}
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                        {getSupportTierTitle(supporter.supportTierId)}
                                    </Typography>
                                    {` — ${supporter.message || 'No message provided'}`}
                                    <br />
                                    <Typography
                                        sx={{ display: 'inline' }}
                                        component="span"
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {new Date(supporter.timestamp).toLocaleString()}
                                    </Typography>
                                    </>
                                }
                                />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                            </React.Fragment>
                        ))}
                        </List>
                        {!showAllSupporters && supporters.length > 5 && (
                            <Button onClick={() => setShowAllSupporters(true)}>View More Supporters</Button>
                        )}
                    </CardContent>
                </Card>
              )}
            <Typography variant="h5" component="h3" gutterBottom>
                Similar Petitions
            </Typography>
            <Grid container spacing={2}>
                {displayPetitions.map((similarPetition) => (
                <Grid item xs={12} sm={6} md={4} key={similarPetition.petitionId}>
                    <Card>
                    <CardMedia
                        component="img"
                        height="140"
                        image={"Test"}
                        alt="Petition Image"
                    />
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                        {similarPetition.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                        Creation Date: {new Date(similarPetition.creationDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                        Category: {similarPetition.categoryId}
                        </Typography>
                        <Grid container alignItems="center">
                        <Grid item>
                            <Avatar
                            alt={`${similarPetition.ownerFirstName} ${similarPetition.ownerLastName}`}
                            src={"Test"}
                            sx={{ width: 24, height: 24, marginRight: 1 }}
                            />
                        </Grid>
                        <Grid item>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                            Owner: {similarPetition.ownerFirstName} {similarPetition.ownerLastName}
                            </Typography>
                        </Grid>
                        </Grid>
                        <Typography variant="body2" color="textSecondary">
                        Supporting Cost: ${similarPetition.supportingCost}
                        </Typography>
                    </CardContent>
                    </Card>
                </Grid>
                ))}
            </Grid>
            {!showAllPetitions && similarPetitions.length > 3 && (
                <Button onClick={() => setShowAllPetitions(true)}>View More Petitions</Button>
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