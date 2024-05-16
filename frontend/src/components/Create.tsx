import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Container, Grid, IconButton, Snackbar, Alert } from '@mui/material';
import NavBar from "./NavBar";
import AddIcon from '@mui/icons-material/Add';
import { Delete } from '@mui/icons-material';
import Cookies from 'js-cookie';

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
    const [snackMessage, setSnackMessage] = React.useState("")
    const [snackOpenSuccess, setSnackOpenSuccess] = React.useState(false)
    const [snackOpenFail, setSnackOpenFail] = React.useState(false)

    const handleSnackCloseSuccess = (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
          return;
      }
      setSnackOpenSuccess(false);
    };
    
    const handleSnackCloseFail = (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
          return;
      }
      setSnackOpenFail(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: name === 'categoryId' ? parseInt(value, 10) : value
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

    const handleRemoveTier = (index: number) => {
      setFormData((prevData) => ({
        ...prevData,
        supportTiers: prevData.supportTiers.filter((_, i) => i !== index),
      }));
    };

    const handleSubmit = async () => {
        axios.post(`http://localhost:4941/api/v1/petitions/`, formData, {headers: {'X-Authorization': Cookies.get("X-Authorization")}})
        .then((response) => {
            setFormData({
                title: '',
                description: '',
                categoryId: 0,
                supportTiers: [],
            })
            setSnackOpenFail(false)
            setSnackOpenSuccess(true)
            setSnackMessage("Successfully Created Petition")
        }, (error) => {
            setSnackMessage(error.response.statusText)
            setSnackOpenFail(true)
        })
    };

    return (
        <div>
            <NavBar></NavBar>
            <Container maxWidth="md">
                <Typography variant="h4" gutterBottom>
                    Create a Petition
                </Typography>
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
                                <IconButton onClick={() => handleRemoveTier(index)} aria-label="delete">
                                    <Delete />
                                </IconButton>
                            </Grid>
                        ))}
                        {formData.supportTiers.length < 3 && (
                            <Grid item xs={12} style={{ justifyContent: 'center' }}>
                                <Button onClick={handleAddTier} variant="outlined" startIcon={<AddIcon />} color="primary">
                                    Add Support Tier
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                    <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
                        Create Petition
                    </Button>
            </Container>
            <Snackbar
                autoHideDuration={6000}
                open={snackOpenSuccess}
                onClose={handleSnackCloseSuccess}
                key={snackMessage}>
                <Alert onClose={handleSnackCloseSuccess} severity="success" sx={{width: '100%'}}>
                    {snackMessage}
                </Alert>
            </Snackbar>
            <Snackbar
                autoHideDuration={6000}
                open={snackOpenFail}
                onClose={handleSnackCloseFail}
                key={snackMessage}>
                <Alert onClose={handleSnackCloseFail} severity="error" sx={{width: '100%'}}>
                    {snackMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default Create;