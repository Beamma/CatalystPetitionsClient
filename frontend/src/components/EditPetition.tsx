import Cookies from 'js-cookie';
import React, { ChangeEvent } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import NavBar from './NavBar';
import NotFound from './NotFound';
import axios from 'axios';
import { Alert, Avatar, Box, Button, Card, CardContent, Container, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, Snackbar, TextField, Typography, styled } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Delete } from '@mui/icons-material';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import DeleteIcon from '@mui/icons-material/Delete';

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

const EditPetition = () => {
    const {id} = useParams();
    const [petitionData, setPetitionData] = React.useState<PetitionFormData>({
        title: '',
        description: '',
        categoryId: 0
    });

    const [tierData, setTeirData] = React.useState<TierData>({supportTiers: []});
    const [staticTierData, setStaticTeirData] = React.useState<TierData>({supportTiers: []});
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
    const [photoExists, setPhotoExists] = React.useState(true);
    const [cancel, setCancel] = React.useState<number>(1);

    React.useEffect(() => {
        getPeitionInfo()
        getSupporters()
        getCategories()
    }, [updateFlag, cancel])

    const compareTiers = () => {
        const newSupportTiers: SupportTier[] = [];
        const changedSupportTiers: SupportTier[] = [];
        const deletedSupportTiers: SupportTier[] = [];
    
        // Iterate over tierData support tiers
        tierData.supportTiers.forEach(tier => {
            // Find the corresponding support tier in staticTierData
            const staticTier = staticTierData.supportTiers.find(staticTier => staticTier.supportTierId === tier.supportTierId);
    
            if (!staticTier) {
                // If the support tier doesn't exist in staticTierData, it's new
                newSupportTiers.push(tier);
            } else if (
                tier.title !== staticTier.title ||
                tier.description !== staticTier.description ||
                tier.cost !== staticTier.cost
            ) {
                // If the support tier exists in staticTierData but has changed, add it to changedSupportTiers
                changedSupportTiers.push(tier);
            }
        });
    
        // Iterate over staticTierData support tiers to find deleted support tiers
        staticTierData.supportTiers.forEach(staticTier => {
            const existingTier = tierData.supportTiers.find(tier => tier.supportTierId === staticTier.supportTierId);
            if (!existingTier) {
                // If the support tier from staticTierData doesn't exist in tierData, it's deleted
                deletedSupportTiers.push(staticTier);
            }
        });
    
        // Return the result
        return {
            newSupportTiers,
            changedSupportTiers,
            deletedSupportTiers
        };
    };

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
                setStaticTeirData({
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
        if (petitionData.title === "" || petitionData.description === "" || petitionData.categoryId === 0) {
            setSnackMessage("Please input all fields")
            setSnackOpenFail(true)
            return
        }

        if (!photoExists) {
            if (selectedFile === null || !(["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(selectedFile.type))) {
                setSnackMessage("Please upload a file of type jpg, png of gif")
                setSnackOpenFail(true)
                return
            }
        }

        const checkedTiers = tierData.supportTiers.map((tier) => {
            if (tier.cost < 0 || tier.description === "" || tier.title === "") {
                return false;
            }
        });

        if (checkedTiers.includes(false)) {
            setSnackMessage("Please fill out all fields the support tiers")
            setSnackOpenFail(true)
            return
        }


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
                    setPhotoExists(true)
                    setSelectedFile(null)
                }, (error) => {
                    setSnackMessage(error.response.statusText)
                    setSnackOpenFail(true)
                })
            }
            
            const { newSupportTiers, changedSupportTiers, deletedSupportTiers } = compareTiers();
            deletedSupportTiers.forEach(deletedTier => {
                axios.delete(`http://localhost:4941/api/v1/petitions/${id}/supportTiers/${deletedTier.supportTierId}`, {headers: {'X-Authorization': Cookies.get("X-Authorization")}});
            });

            newSupportTiers.forEach(newTier => {
                axios.put(`http://localhost:4941/api/v1/petitions/${id}/supportTiers`,newTier, {headers: {'X-Authorization': Cookies.get("X-Authorization")}})
            });

            changedSupportTiers.forEach(changedTier => {
                axios.patch(`http://localhost:4941/api/v1/petitions/${id}/supportTiers/${changedTier.supportTierId}`,changedTier, {headers: {'X-Authorization': Cookies.get("X-Authorization")}})
            });

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

    const hasSupporters = (supportTierId: number): boolean => {
        return supporters.some(supporter => supporter.supportTierId === supportTierId);
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
        setPhotoExists(false)
    }

    const displayImageUpload = () => {
        if (photoExists === true) {
            return (
                <div>
                    <img src={`http://localhost:4941/api/v1/petitions/${id}/image` || ""} width="80%" style={{ borderRadius: '5px' }}></img>
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
        } else if (selectedFile === null) {
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
                            value={petitionData.description}
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
                    </Grid>
                </Grid>
        )
    }

    const displaySupportTierCard = (index: number, tier: SupportTier) => {
        if (hasSupporters(tier.supportTierId)) {
            return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                    <Typography variant="h6">
                        Support Tier {index + 1}
                        {tierData.supportTiers.length > 1 && (
                            <IconButton onClick={() => handleRemoveTier(index)} aria-label="delete" disabled>
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
                        disabled
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
                        disabled
                    />
                    <TextField
                        fullWidth
                        required
                        type="number"
                        label="Cost"
                        value={tier.cost}
                        onChange={(e) => handleTierChange(index, 'cost', parseFloat(e.target.value))}
                        margin="normal"
                        disabled
                    />
                </Grid>
            )
        }

        return (
            <Grid item xs={12} sm={6} md={4} key={index}>
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
            </Grid>
        )
    }

    const displayAddSupportTier = () => {
        return (
            <Grid container spacing={2}>
                {tierData.supportTiers.map((tier, index) => (
                    displaySupportTierCard(index, tier)
                ))}
                {tierData.supportTiers.length < 3 && (
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
                                value={petitionData.title}
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
                        <Typography variant="body2" sx={{ fontStyle: "italic" }}  gutterBottom>
                            You may only edit and delete petitions that have no supporters
                        </Typography>
                        <Grid container spacing={2}>
                            {displayAddSupportTier()}
                        </Grid>
                    </CardContent>
                    <Button type="submit" variant="outlined" color="primary" onClick={handleCancel} sx={{ margin: "5px"}}>
                        Revert Changes
                    </Button>
                    <Button type="submit" variant="contained" color="primary" onClick={handleSubmit} sx={{ margin: "5px"}}>
                        Edit Petition
                    </Button>
                </Card>
            </Container>
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
                <NavBar></NavBar>
                {errorMessage}
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


export default EditPetition