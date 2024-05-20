import Cookies from 'js-cookie';
import React, { ChangeEvent } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import NavBar from './NavBar';
import NotFound from './NotFound';
import axios from 'axios';
import { Alert, Avatar, Button, Card, Container, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, Snackbar, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Delete } from '@mui/icons-material';

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

interface PetitionFormData {
    title: string;
    description: string;
    categoryId: number;
}

interface TierData {
    supportTiers: SupportTier[]
}

interface SupportTier {
    title: string;
    description: string;
    cost: number;
    supportTierId: number;
}

interface Category {
    categoryId: number;
    name: string;
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

const EditPetition = () => {
    const {id} = useParams();
    const [petitionData, setPetitionData] = React.useState<PetitionFormData>({
        title: '',
        description: '',
        categoryId: 0
    });

    const [tierData, setTeirData] = React.useState<TierData>({supportTiers: []});
    const [error, setError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [supporters, setSupporters] = React.useState<Supporter[]>([]);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [snackMessage, setSnackMessage] = React.useState("")
    const [snackOpenSuccess, setSnackOpenSuccess] = React.useState(false)
    const [snackOpenFail, setSnackOpenFail] = React.useState(false)
    const [ownerId, setOwnerId] = React.useState<number | null>()
    const [updateFlag, setUpdateFlag] = React.useState<number>(1)
    const [photoExists, setPhotoExists] = React.useState(false);
    const [cancel, setCancel] = React.useState<number>(1);

    React.useEffect(() => {
        getPeitionInfo()
        getSupporters()
        getCategories()
    }, [updateFlag, cancel])

    const getPeitionInfo = async () => {
        if (! id?.match(/^\d+$/)) {
            setError(true);
            setErrorMessage("404 Not Found");
        } else {
            axios.get(`http://localhost:4941/api/v1/petitions/${id}/`)
            .then((response) => {
                setPetitionData({
                    title: response.data.title,
                    description: response.data.description,
                    categoryId: response.data.categoryId
                })

                setTeirData({
                    supportTiers: response.data.supportTiers
                })
                setOwnerId(response.data.ownerId)
            }, (error) => {
                setError(true);
                setErrorMessage(error.statusText)
            })

            axios.get(`http://localhost:4941/api/v1/petitions/${id}/image`)
                .then((response) => {
                    console.log(response.status)
                    if (response.status === 404) {
                        setPhotoExists(false);
                    } else {
                        setPhotoExists(true);
                    }
                }, (error) => {
                    setPhotoExists(false);
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

    const getCategories = () => {
        axios.get(`http://localhost:4941/api/v1/petitions/categories/`)
            .then((response) => {
                setCategories(response.data);
            }, (error) => {
                setError(true);
                setErrorMessage(error.statusText)
            })
    }

    const handleSubmit = async () => {
        axios.patch(`http://localhost:4941/api/v1/petitions/${id}`, petitionData, {headers: {'X-Authorization': Cookies.get("X-Authorization")}})
        .then((response) => {
            setPetitionData({
                title: '',
                description: '',
                categoryId: 0
            })
            if (selectedFile !== null) {
                axios.put(`http://localhost:4941/api/v1/petitions/${id}/image`, selectedFile, {headers: {'X-Authorization': Cookies.get("X-Authorization"), "Content-Type": selectedFile.type}})
                .then((response) => {
                    setUpdateFlag(updateFlag * -1)
                }, (error) => {
                    setSnackMessage(error.response.statusText)
                    setSnackOpenFail(true)
                })
            }
            setSnackOpenFail(false)
            setSnackOpenSuccess(true)
            setSnackMessage("Successfully Updated Petition")
            setUpdateFlag(updateFlag * -1)
        }, (error) => {
            setSnackMessage(error.response.statusText)
            setSnackOpenFail(true)
        })

        
    };

    const handleCancel = () => {
        setCancel(cancel * -1)
        setSelectedFile(null)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<number>) => {
        const { name, value } = e.target;
        if (name === 'categoryId') {
            setPetitionData((prevData) => ({
                ...prevData,
                [name]: Number(value)
            }));
        } else {
            setPetitionData((prevData) => ({
                ...prevData,
                [name]: value
            }));
        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
          setSelectedFile(event.target.files[0]);
        }
    };

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

    const changeUpdateImage = () => {
        setPhotoExists(false)
    }

    const handleTierChange = (index: number, field: string, value: string | number) => {
        setTeirData((prevData) => {
            const updatedTiers = [...prevData.supportTiers];
            updatedTiers[index] = { ...updatedTiers[index], [field]: value };
            return { ...prevData, supportTiers: updatedTiers };
        });
    };

    const handleAddTier = () => {
        if (tierData.supportTiers.length < 3) {
            setTeirData((prevData) => ({
                ...prevData,
                supportTiers: [...prevData.supportTiers, { title: '', description: '', cost: 0, supportTierId: 0 }],
            }));
        }
    };

    const handleRemoveTier = (index: number) => {
        setTeirData((prevData) => ({
            ...prevData,
            supportTiers: prevData.supportTiers.filter((_, i) => i !== index),
        }));
    };

    const displayPetitionDetails = () => {
        return (
            <div>
                <TextField
                    fullWidth
                    required
                    label="Title"
                    name="title"
                    value={petitionData.title}
                    onChange={handleChange}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    required
                    label="Description"
                    name="description"
                    value={petitionData.description}
                    onChange={handleChange}
                    margin="normal"
                    multiline
                    rows={4}
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                        labelId="category-label"
                        id="category"
                        value={petitionData.categoryId}
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
                {displayImage()}
            </div>
        )
    }

    const displayTiers = () => {
        return (
            <Card variant="outlined">
                <div className="scrollable-container">
                    {tierData.supportTiers.map((tier, index) => (
                        <Container>
                            <Typography variant="h6">
                                Support Tier {index + 1}
                                {tierData.supportTiers.length > 1 && (
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
                        </Container>
                    ))}
                    {tierData.supportTiers.length < 3 && (
                        <Button onClick={handleAddTier} variant="outlined" startIcon={<AddIcon />} color="primary">
                            Add Support Tier
                        </Button>
                    )}
                </div>
            </Card>
        )
    }

    const displayImage = () => {
        if (photoExists) {
            return (
                <div>
                    <img src={`http://localhost:4941/api/v1/petitions/${id}/image`} width={250} height={250} style={{ borderRadius: '50%' }} alt='Hero'></img>
                    <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={changeUpdateImage}
                    >
                        Change Image
                    </Button>
                </div>
                
            )
        } else {
            if (selectedFile) {
                return(
                    <div>
                        <img src={URL.createObjectURL(selectedFile) || ""} width={250} height={250} style={{ borderRadius: '50%' }} alt='Hero'></img>
                        <TextField
                        fullWidth
                        color="secondary"
                        type="file"
                        onChange={handleFileChange}/>
                    </div>
                    
                )
            } else {
                return (
                    <div>
                        <TextField
                        fullWidth
                        color="secondary"
                        type="file"
                        onChange={handleFileChange}/>
                    </div>
                    
                )
            }
        }
        
    }

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

    if (Number(Cookies.get("userId")) !== ownerId) {
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
            <Typography variant="h4" gutterBottom>
                Edit Petition
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Container>
                        <Typography variant="h6">
                            Support Tier
                        </Typography>
                        {displayPetitionDetails()}
                        <Button type="submit" variant="outlined" color="primary" onClick={handleCancel}>
                            Revert Changes
                        </Button>
                        <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
                            Create Petition
                        </Button>
                    </Container>
                </Grid>
                <Grid item xs={12} sm={6} justifyContent="center">
                    {displayTiers()}
                </Grid>
            </Grid>
            {displaySnack()}
        </div>
    )
}


export default EditPetition