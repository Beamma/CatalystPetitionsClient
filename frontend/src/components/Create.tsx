import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Container, Grid } from '@mui/material';
import NavBar from "./NavBar";

interface SupportTier {
    title: string;
    description: string;
    cost: number;
}

interface PetitionFormData {
    title: string;
    description: string;
    categoryId: number;
    supportTiers: SupportTier[];
}

const Create = () => {
    const [formData, setFormData] = useState<PetitionFormData>({
        title: '',
        description: '',
        categoryId: 0,
        supportTiers: [],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleTierChange = (index: number, field: string, value: string | number) => {
        setFormData((prevData) => {
            const updatedTiers = [...prevData.supportTiers];
            updatedTiers[index] = { ...updatedTiers[index], [field]: value };
            return { ...prevData, supportTiers: updatedTiers };
        });
    };

    const handleAddTier = () => {
        if (formData.supportTiers.length < 3) {
            setFormData((prevData) => ({
                ...prevData,
                supportTiers: [...prevData.supportTiers, { title: '', description: '', cost: 0 }],
            }));
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post('/api/petitions', formData);
            console.log(response.data);
        } catch (error) {
            console.error('Error creating petition:', error);
        }
    };

    return (
        <div>
            <NavBar></NavBar>
            <Container maxWidth="sm">
                <Typography variant="h4" gutterBottom>
                    Create a Petition
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        required
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        required
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        margin="normal"
                        multiline
                        rows={4}
                    />
                    <TextField
                        fullWidth
                        required
                        type="number"
                        label="Category ID"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        margin="normal"
                    />
                    {formData.supportTiers.map((tier, index) => (
                        <div key={index}>
                            <Typography variant="h6">Support Tier {index + 1}</Typography>
                            <TextField
                                fullWidth
                                required
                                label="Title"
                                value={tier.title}
                                onChange={(e) => handleTierChange(index, 'title', e.target.value)}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                required
                                label="Description"
                                value={tier.description}
                                onChange={(e) => handleTierChange(index, 'description', e.target.value)}
                                margin="normal"
                                multiline
                                rows={4}
                            />
                            <TextField
                                fullWidth
                                required
                                type="number"
                                label="Cost"
                                value={tier.cost}
                                onChange={(e) => handleTierChange(index, 'cost', parseFloat(e.target.value))}
                                margin="normal"
                            />
                        </div>
                    ))}
                    <Button onClick={handleAddTier} variant="outlined" color="primary">
                        Add Support Tier
                    </Button>
                    <Button type="submit" variant="contained" color="primary">
                        Create Petition
                    </Button>
                </form>
            </Container>
        </div>
    );
}

export default Create;