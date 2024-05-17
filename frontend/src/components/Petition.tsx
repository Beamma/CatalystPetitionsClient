import React from 'react';
import NavBar from './NavBar';
import { Link, useParams } from "react-router-dom";
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

interface Category {
    categoryId: number;
    name: string;
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
    const [categories, setCategories] = React.useState<Category[]>([]);

    React.useEffect(() => {
        getPeitionInfo()
        getSupporters()
        getCategories()
    }, [])

    React.useEffect(() => {
        getSimilarPetitions()
    }, [petition])

    // const updateSimilarPetition = (toAdd: SimilarPetition[]) => {
    //     let tempSimilar = similarPetitions
    //     tempSimilar = tempSimilar.concat(toAdd)
    //     console.log(similarPetitions)
    //     console.log(toAdd)
    //     setSimilarPetitions(tempSimilar)
    // }

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

    const getCategories = () => {
        axios.get(`http://localhost:4941/api/v1/petitions/categories/`)
            .then((response) => {
                setCategories(response.data);
            }, (error) => {
                setError(true);
                setErrorMessage(error.statusText)
            })
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
        } 
        
        try {
            const [response1, response2] = await Promise.all([
                axios.get<{ petitions: SimilarPetition[] }>('http://localhost:4941/api/v1/petitions/', { params: { categoryIds: petition?.categoryId, count: 20 } }),
                axios.get<{ petitions: SimilarPetition[] }>('http://localhost:4941/api/v1/petitions/', { params: { ownerId: petition?.ownerId, count: 20 } })
            ]);
            
            const combinedPetitions = [...response1.data.petitions, ...response2.data.petitions];
            const uniquePetitions = Array.from(
                new Map(combinedPetitions.map((petition) => [petition.petitionId, petition])).values()
            );
            const filteredPetitions = uniquePetitions.filter(p => p.petitionId !== Number(id));

            setSimilarPetitions(filteredPetitions);
        } catch (error) {
            setError(true);
            setErrorMessage("An error occured while trying to get similar petitions");
        }
    }

    const getSupportTierTitle = (tierId: number) => {
        const tier = petition?.supportTiers.find(t => t.supportTierId === tierId);
        return tier ? tier.title : 'Unknown Tier';
      };

    const displaySupporters = showAllSupporters ? supporters : supporters.slice(0, 5);

    const displayPetitions = showAllPetitions ? similarPetitions : similarPetitions.slice(0, 3);

    const categoryMap: { [key: number]: string } = {};
        categories.forEach(category => {
            categoryMap[category.categoryId] = category.name;
    });

    const displaySimilarPetitions = () => {


        return (
            <div>
                <Typography variant="h5" component="h3" gutterBottom>
                    Similar Petitions
                </Typography>
                <Grid container spacing={2}>
                    {displayPetitions.map((similarPetition) => (
                        <Grid item xs={12} sm={6} md={4} key={similarPetition.petitionId}>
                            <a href={`/petitions/${similarPetition.petitionId}`}>
                                <Card>
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image={`http://localhost:4941/api/v1/petitions/${similarPetition.petitionId}/image`}
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
                                            Category: {categoryMap[similarPetition.categoryId]}
                                        </Typography>
                                        <Grid container alignItems="center" justifyContent="center">
                                            <Grid item>
                                                <Avatar
                                                alt={`${similarPetition.ownerFirstName} ${similarPetition.ownerLastName}`}
                                                src={`http://localhost:4941/api/v1/users/${similarPetition.ownerId}/image` || '/default-profile.png'}
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
                            </ a>
                        </Grid>
                    ))}
                </Grid>
                {!showAllPetitions && similarPetitions.length > 3 && (
                    <Button onClick={() => setShowAllPetitions(true)}>View More Petitions</Button>
                )}
            </div>
        );
    }

    const displayPetitionInfo = () => {
        return (
            <Container>
                {petition && (
                    <Card sx={{ marginTop: 4 }}>
                        <Typography variant="h2" component="h1" gutterBottom>
                            {petition.title}
                        </Typography>
                        <Grid container spacing={2} >
                            <Grid item xs={6}>
                                <img src={'http://localhost:4941/api/v1/petitions/' + petition.petitionId +'/image'} width="80%" ></img>
                            </Grid>
                            <Grid item xs={6}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item>
                                        <Avatar
                                        alt={`${petition.ownerFirstName} ${petition.ownerLastName}`}
                                        src={'http://localhost:4941/api/v1/users/' + petition.ownerId +'/image'}
                                        sx={{ width: 56, height: 56 }}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="h6" component="h2">
                                            {petition.ownerFirstName} {petition.ownerLastName}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Typography variant="body1" align='left'>
                                    <b>Category:</b> {categoryMap[petition.categoryId]}
                                </Typography>
                                <Typography variant="body1" align='left'>
                                    <b>Number of Supporters:</b> {petition.numberOfSupporters}
                                </Typography>
                                <Typography variant="body1" align='left'>
                                    <b>Created On:</b> {new Date(petition.creationDate).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body1" paragraph align='left'>
                                    <b>Description:</b> {petition.description}
                                </Typography>
                                <Typography variant="body1" align='left'>
                                    <b>Money Raised:</b> ${petition.moneyRaised}
                                </Typography>
                            </Grid>
                        </Grid>
                        <CardContent>
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
                {displaySimilarPetitions()}
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