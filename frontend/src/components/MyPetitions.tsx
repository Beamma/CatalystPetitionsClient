import { useEffect, useState } from 'react';
import NavBar from './NavBar';
import PetitionCard from './PetitionCard';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { Navigate } from 'react-router-dom';

interface Petition {
    petitionId: number;
    title: string;
    categoryId: number;
    ownerId: number;
    ownerFirstName: string;
    ownerLastName: string;
    numberOfSupporters: number;
    creationDate: string;
    supportingCost: number;
    categoryName?: string; // Add categoryName property
    ownerProfilePictureUrl?: string;
} 
  
interface PetitionsResponse {
    petitions: Petition[];
    count: number;
}

interface Category {
    categoryId: number;
    name: string;
}

const MyPetitions = () => {
    const [petitions, setPetitions] = useState<Petition[]>([]);
    const [petitionPage, setPetitionPage] = useState<string>("Owned");

    useEffect(() => {
    }, [])

    useEffect(() => {
        fetchPetitions();
    }, [petitionPage])

    const fetchPetitions = async () => {
        try {
            let url = ""
            if (petitionPage === "Supported") {
                url = `http://localhost:4941/api/v1/petitions?supporterId=${Cookies.get("userId")}`
            } else {
                url = `http://localhost:4941/api/v1/petitions?ownerId=${Cookies.get("userId")}`
            }

            const [petitionsResponse, categoriesResponse] = await Promise.all([
                axios.get<PetitionsResponse>(url),
                axios.get<Category[]>('http://localhost:4941/api/v1/petitions/categories/')
            ]);
            const petitionsData = petitionsResponse.data.petitions;
            const categoriesData = categoriesResponse.data;

            const petitionsWithCategories = await Promise.all(petitionsData.map(async (petition) => {
                
                const ownerProfilePictureUrl = `http://localhost:4941/api/v1/users/${petition.ownerId}/image`
                const category = categoriesData.find(cat => cat.categoryId === petition.categoryId);
                return { ...petition, ownerProfilePictureUrl, categoryName: category ? category.name : 'Unknown' };
            }));
              setPetitions(petitionsWithCategories);
        } catch (error) {
              console.error('Error fetching petitions or categories:', error);
        }
    }

        const changeButtonsSupported = () => {
            setPetitionPage("Supported")
        }

        const changeButtonsOwned = () => {
            setPetitionPage("Owned")
        }

        const displayTopButtons = () => {
            if (petitionPage === "Owned") {
                return (
                    <Box width="100%" p={2} mb={2} display="flex" justifyContent="center" alignItems="center">
                        <Box width="30%" m={2}>
                            <Button variant="outlined" size="large" fullWidth disabled>Owned</Button>
                        </Box>
                        <Box width="30%" m={2}>
                            <Button variant="contained" size="large" fullWidth onClick={changeButtonsSupported}>Supported</Button>
                        </Box>
                    </Box>
                )
            } else {
                return (
                    <Box width="100%" p={2} mb={2} display="flex" justifyContent="center" alignItems="center">
                        <Box width="30%" m={2}>
                            <Button variant="contained" size="large" fullWidth onClick={changeButtonsOwned}>Owned</Button>
                        </Box>
                        <Box width="30%" m={2}>
                            <Button variant="outlined" size="large" fullWidth disabled>Supported</Button>
                        </Box>
                    </Box>
                )
            }
        }

    if (Cookies.get("userId") === undefined) {
        return(<Navigate to={"/home"} />)
    }
    
    if (petitions.length === 0) {
        return (
            <div>
                <NavBar></NavBar>
                {displayTopButtons()}
                <Typography variant="h2" gutterBottom sx={{ 
                    margin: '200px',
                    marginBottom: '20px'
                }}>
                    No petitions to display
                </Typography>
                <Typography sx={{fontStyle: 'italic'}}>
                    Try Creating Or Supporting One!
                </Typography>
            </div>
        )
    }
    
    return (
        <div>
            <NavBar />
            {displayTopButtons()}
            <Container maxWidth="xl">
                <Grid container spacing={3}>
                    {petitions.map((petition) => (
                        <Grid item xs={12} sm={6} md={3} key={petition.petitionId}>
                            <PetitionCard
                                key={petition.petitionId}
                                title={petition.title}
                                ownerFirstName={petition.ownerFirstName}
                                ownerLastName={petition.ownerLastName}
                                numberOfSupporters={petition.numberOfSupporters}
                                creationDate={petition.creationDate}
                                imageUrl={`http://localhost:4941/api/v1/petitions/${petition.petitionId}/image` || ''}
                                categoryName={petition.categoryName || 'Unknown'}
                                ownerProfilePictureUrl={petition.ownerProfilePictureUrl || ''}
                                supportingCost={petition.supportingCost}
                                categoryId={petition.categoryId}
                                petitionId={petition.petitionId}
                                ownerId={petition.ownerId}
                            />
                        </ Grid>
                    ))}
                </Grid>
            </Container>
        </div>
    )
}

export default MyPetitions