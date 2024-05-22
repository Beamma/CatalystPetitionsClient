import React, { ChangeEvent, useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Grid, IconButton, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Card, Paper, Container, Box, styled, CardContent } from '@mui/material';
import NavBar from "./NavBar";
import AddIcon from '@mui/icons-material/Add';
import { Delete, Padding } from '@mui/icons-material';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import DeleteIcon from '@mui/icons-material/Delete';
import Cookies from 'js-cookie';
import './styles.css'; // Import the CSS file

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

interface Category {
    categoryId: number;
    name: string;
}

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const CenteredGridItem = styled(Grid)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
});

const Create = () => {
    const [formData, setFormData] = useState<PetitionFormData>({
        title: '',
        description: '',
        categoryId: 0,
        supportTiers: [{ title: '', description: '', cost: 0 }],
    });
    const [snackMessage, setSnackMessage] = React.useState("")
    const [snackOpenSuccess, setSnackOpenSuccess] = React.useState(false)
    const [snackOpenFail, setSnackOpenFail] = React.useState(false)
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [error, setError] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string>("");
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

    React.useEffect(() => {
        getCategories()
    }, [])

    const getCategories = () => {
        axios.get(`http://localhost:4941/api/v1/petitions/categories/`)
            .then((response) => {
                setCategories(response.data);
            }, (error) => {
                setError(true);
                setErrorMessage(error.statusText)
        })
    }

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<number>) => {
        const { name, value } = e.target;
        if (name === 'categoryId') {
            setFormData((prevData) => ({
                ...prevData,
                [name]: Number(value)
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value
            }));
        }
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
        if (formData.title === "" || formData.description === "" || formData.categoryId === 0) {
            setSnackMessage("Please input all fields")
            setSnackOpenFail(true)
            return
        }

        if (selectedFile === null || !(["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(selectedFile.type))) {
            setSnackMessage("Please upload a file of type jpg, png of gif")
            setSnackOpenFail(true)
            return
        }

        const checkedTiers = formData.supportTiers.map((tier) => {
            if (tier.cost < 0 || tier.description === "" || tier.title === "") {
                return false;
            }
        });

        if (checkedTiers.includes(false)) {
            setSnackMessage("Please fill out all fields the support tiers")
            setSnackOpenFail(true)
            return
        }

        axios.post(`http://localhost:4941/api/v1/petitions/`, formData, {headers: {'X-Authorization': Cookies.get("X-Authorization")}})
        .then((response) => {
            setFormData({
                title: '',
                description: '',
                categoryId: 0,
                supportTiers: [{ title: '', description: '', cost: 0 }],
            })
            if (selectedFile !== null) {
                axios.put(`http://localhost:4941/api/v1/petitions/${response.data.petitionId}/image`, selectedFile, {headers: {'X-Authorization': Cookies.get("X-Authorization"), "Content-Type": selectedFile.type}})
                .then((response) => {

                }, (error) => {
                    setSnackMessage(error.response.statusText)
                    setSnackOpenFail(true)
                })
            }
            setSnackOpenFail(false)
            setSnackOpenSuccess(true)
            setSnackMessage("Successfully Created Petition")
        }, (error) => {
            setSnackMessage(error.response.statusText)
            setSnackOpenFail(true)
        })
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
          setSelectedFile(event.target.files[0]);
        }
    };

    const displaySnack = () => {
        return (
            <div>
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
        )
    }

    const handleRemoveImage = () => {
        setSelectedFile(null)
    }

    const displayImageUpload = () => {
        if (selectedFile === null) {

            return (
                <div>
                    <Box
                        sx={{
                            width: '80%',
                            paddingTop: '60%', // 1:1 aspect ratio
                            position: 'relative',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '75%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Button
                                component="label"
                                role={undefined}
                                variant="text"
                                tabIndex={-1}
                                startIcon={<InsertPhotoIcon />}
                            >
                                Upload Petition Image
                                <VisuallyHiddenInput type="file" onChange={handleFileChange}/>
                            </Button>
                        </Box>
                    </Box>
                </div>
            )
        } else {
            return (
                <div>
                        <img src={URL.createObjectURL(selectedFile) || ""} width="80%" style={{ borderRadius: '5px' }}></img>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<DeleteIcon />}
                            onClick={handleRemoveImage}
                            sx={{ marginTop: "10px"}}
                        >
                            Remove Image
                        </Button>
                </div>
            )
            
        }
    }

    const displayPetitionInfo = () => {
        return (
            <Grid container direction="column" spacing={2}>
                    <Grid item>
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
                    </Grid>
                    <Grid item>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="category-label">Category</InputLabel>
                            <Select
                                labelId="category-label"
                                id="category"
                                value={formData.categoryId}
                                onChange={handleChange}
                                name="categoryId"
                                required
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category.categoryId} value={category.categoryId}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
        )
    }

    const displayAddSupportTier = () => {
        return (
            <Grid container spacing={2}>
                {formData.supportTiers.map((tier, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Typography variant="h6">
                            Support Tier {index + 1}
                            {formData.supportTiers.length > 1 && (
                                <IconButton onClick={() => handleRemoveTier(index)} aria-label="delete">
                                    <Delete />
                                </IconButton>
                            )}
                        </Typography>
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
                    <CenteredGridItem xs={12} sm={6} md={4}>
                        <Button onClick={handleAddTier} variant="outlined" startIcon={<AddIcon />} color="primary">
                            Add Support Tier
                        </Button>
                    </CenteredGridItem>
                )}
            </Grid>
        )
    }

    const displayPetitionCreateBody = () => {
        return (
            <Container>
                <Card sx={{ marginTop: 4, marginBottom: '20px', padding: 2}}>
                    <Grid container justifyContent="center">
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                margin="normal"
                            />
                        </Grid>
                    </Grid>
                    <Grid container justifyContent="center" spacing={2} sx={{ padding: "10px"}}>
                        <Grid item xs={12} sm={6}>
                            {displayImageUpload()}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {displayPetitionInfo()}
                        </Grid>
                    </Grid>
                    <CardContent>
                        <Typography variant="h5" component="h3" gutterBottom>
                            Support Tiers
                        </Typography>
                        <Grid container spacing={2}>
                            {displayAddSupportTier()}
                        </Grid>
                    </CardContent>
                    <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
                        Create Petition
                    </Button>
                </Card>
            </Container>
        )

    }

    if (error) {
        return (
            <div>
                <NavBar></NavBar>
                {error}
            </div>
        )
    }

    return (
        <div>
            <NavBar></NavBar>
            <Typography variant="h2" component="h1">
                Create A Petition
            </Typography>
            {displayPetitionCreateBody()}
            {displaySnack()}
        </div>
    )
}

export default Create;