import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import PetitionCard from './PetitionCard';
import axios from 'axios';
import { Cookie } from '@mui/icons-material';
import Cookies from 'js-cookie';
import { Container } from '@mui/material';

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
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        fetchPetitions();
    }, [])

    const fetchPetitions = async () => {
        try {
            const [petitionsResponse, categoriesResponse] = await Promise.all([
              axios.get<PetitionsResponse>(`http://localhost:4941/api/v1/petitions?ownerId=${Cookies.get("userId")}`),
              axios.get<Category[]>('http://localhost:4941/api/v1/petitions/categories/')
            ]);

            const petitionsData = petitionsResponse.data.petitions;
            const categoriesData = categoriesResponse.data;

            const petitionsWithCategories = await Promise.all(petitionsData.map(async (petition) => {
                
                const ownerProfilePictureUrl = `http://localhost:4941/api/v1/users/${Cookies.get("userId")}/image`
                const category = categoriesData.find(cat => cat.categoryId === petition.categoryId);
                return { ...petition, ownerProfilePictureUrl, categoryName: category ? category.name : 'Unknown' };
            }));
              setPetitions(petitionsWithCategories);
            } catch (error) {
              console.error('Error fetching petitions or categories:', error);
            }
        }
    
    
    return (
        <div>
            <NavBar />
            <Container>
                {petitions.map((petition) => (
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
                    />
                 ))}
            </Container>
        </div>
    )
}

export default MyPetitions