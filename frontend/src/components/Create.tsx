import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Container, Grid, IconButton } from '@mui/material';
import NavBar from "./NavBar";
import AddIcon from '@mui/icons-material/Add';
import { Delete } from '@mui/icons-material';

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

    const handleRemoveTier = () => {
      setFormData((prevData) => ({
        ...prevData,
        supportTiers: prevData.supportTiers.filter((_, i) => i ),
      }));
    };

    const handleSubmit = async () => {
        axios.post(`http://localhost:4941/api/v1/petitions/`, formData)
        .then((response) => {
            console.log(response);
            console.log("Success")
        }, (error) => {
            console.log(error)
            console.log("Failure")
        })
    };

    return (
        <div>
            <NavBar></NavBar>
            <Container maxWidth="md">
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
                    <Grid container spacing={2}>
                        {formData.supportTiers.map((tier, index) => (
                            <Grid item xs={12} sm={4} key={index} >
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
                            </Grid>
                        ))}
                        {formData.supportTiers.length < 3 && (
                            <Grid item xs={12} style={{ justifyContent: 'center' }}>
                                <Button onClick={handleAddTier} variant="outlined" startIcon={<AddIcon />} color="primary">
                                    Add Support Tier
                                </Button>
                            </Grid>
                        )}
                        {formData.supportTiers.length > 0 && (
                            <Grid item xs={12} style={{ justifyContent: 'center' }}>
                                <Button onClick={() => handleRemoveTier()} variant='outlined' startIcon={<Delete />}>
                                    Remove Tier
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                    <Button type="submit" variant="contained" color="primary">
                        Create Petition
                    </Button>
                </form>
            </Container>
        </div>
    );
}

export default Create;