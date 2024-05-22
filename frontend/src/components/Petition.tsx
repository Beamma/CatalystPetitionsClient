import React from 'react';
import NavBar from './NavBar';
import { Link, Navigate, useParams } from "react-router-dom";
import axios, { AxiosResponse } from 'axios';
import { Alert, Avatar, Box, Button, Card, CardContent, CardMedia, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, List, ListItem, ListItemAvatar, ListItemText, Modal, Snackbar, TextField, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Cookies from 'js-cookie';
import { Margin } from '@mui/icons-material';
import PetitionCard from './PetitionCard';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};    

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
    numberOfSupporters: number;
    creationDate: string;
    supportingCost: number;
    categoryName?: string; // Add categoryName property
    ownerProfilePictureUrl?: string;
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
    const [editFlag, setEditFlag] = React.useState<boolean>(false);
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [snackMessage, setSnackMessage] = React.useState("")
    const [snackOpenFail, setSnackOpenFail] = React.useState(false)
    const [snackOpenSuccess, setSnackOpenSuccess] = React.useState(false)
    const [redriect, setRedirect] = React.useState(false)
    const [supportOpen, setSupportOpen] = React.useState(false);
    const [reload, setReload] = React.useState(1)
    const [tierToSupport, setTierToSupport] = React.useState(0);
    const [supportMessage, setSupportMessage] = React.useState("");

    React.useEffect(() => {
        getPeitionInfo()
        getSupporters()
        getCategories()
        displayPetitionInfo()
    }, [reload])

    React.useEffect(() => {
        getSimilarPetitions()
    }, [petition])

    React.useEffect(() => {

    }, [editFlag, redriect])

    React.useEffect(() => {
    }, [reload])

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

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(new Date(petition?.creationDate || "2024-01-01"));

    const getSimilarPetitions = async () => {
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
            
            const petitionsWithCategories = await Promise.all(filteredPetitions.map(async (petition) => {
                const ownerProfilePictureUrl = `http://localhost:4941/api/v1/users/${petition.ownerId}/image`
                const category = categories.find(cat => cat.categoryId === petition.categoryId);
                return { ...petition, ownerProfilePictureUrl, categoryName: category ? category.name : 'Unknown' };
            }));

            setSimilarPetitions(petitionsWithCategories);
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

    const edit = () => {
        setEditFlag(true)
    }

    const deletePetition = () => {
        axios.delete(`http://localhost:4941/api/v1/petitions/${id}`, {headers: {'X-Authorization': Cookies.get("X-Authorization")}})
        .then((response) => {
            setRedirect(true)
        }, (error) => {
            setSnackMessage(error.response.statusText)
            setSnackOpenFail(true)
        })
    }

    const handleSnackCloseFail = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackOpenFail(false);
      };

      const handleSnackCloseSuccess = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackOpenSuccess(false);
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

    const displayEditButton= (ownerId: number) => {
        if (Number(Cookies.get("userId")) === ownerId) {
            return (
                <div>
                    <Button onClick={edit} variant="outlined" startIcon={<EditIcon />} color="primary">
                        Edit Petition
                    </Button>
                    {displayDelete()}
                </div>
            )
        } else {
            return
        }
    }

    const displayDelete = () => {
        if (supporters.length === 0) {
            return (
                <Button onClick={handleOpen} variant="outlined" startIcon={<DeleteIcon />} color="primary">
                    Delete Petition
                </Button>
            )
        } else {
            return (
                <Button onClick={handleOpen} variant="outlined" startIcon={<DeleteIcon />} color="primary" disabled>
                    Delete Petition
                </Button>
            )
        }
    }

    const displaySimilarPetitions = () => {
        if (similarPetitions.length === 0) {
            return
        }
        return (
            <div style={{ paddingBottom: '20px' }}>
                <Typography variant="h5" component="h3" gutterBottom>
                    Similar Petitions
                </Typography>
                <Grid container spacing={2}>
                    {displayPetitions.map((similarPetition) => (
                        <Grid item xs={12} sm={6} md={4} key={similarPetition.petitionId}>
                            <PetitionCard
                                key={similarPetition.petitionId}
                                title={similarPetition.title}
                                ownerFirstName={similarPetition.ownerFirstName}
                                ownerLastName={similarPetition.ownerLastName}
                                numberOfSupporters={similarPetition.numberOfSupporters}
                                creationDate={similarPetition.creationDate}
                                imageUrl={`http://localhost:4941/api/v1/petitions/${similarPetition.petitionId}/image` || ''}
                                categoryName={similarPetition.categoryName || 'Unknown'}
                                ownerProfilePictureUrl={similarPetition.ownerProfilePictureUrl || ''}
                                supportingCost={similarPetition.supportingCost}
                                categoryId={similarPetition.categoryId}
                                petitionId={similarPetition.petitionId}
                                ownerId={similarPetition.ownerId}
                            />
                        </ Grid>
                    ))}
                </Grid>
                {!showAllPetitions && similarPetitions.length > 3 && (
                    <Button onClick={() => setShowAllPetitions(true)}>View More Petitions</Button>
                )}
            </div>
        );
    }

    const modal = () => {
        return (
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Are you sure you want to delete this petition?
                    </Typography>
                    <Button onClick={deletePetition} variant="contained" startIcon={<DeleteIcon />} color="primary">
                        Confirm
                    </Button>
                    <Button onClick={handleClose} variant="outlined" startIcon={<DeleteIcon />} color="primary">
                        Cancel
                    </Button>
                </Box>
            </Modal>
        )
    }

    const handleSupportClickOpen = (tierId: number) => {
        console.log("Test")
        console.log(tierId)
        setTierToSupport(tierId)
        setSupportOpen(true);
    };

    const handleSupportClose = () => {
        setSupportOpen(false);
    };

    const handleSupportConfirm = () => {
        // Handle support confirmation logic here
        setSupportOpen(false);
        let data = {}
        if (supportMessage === "") {
            data = {supportTierId: tierToSupport}
        } else {
            data = {supportTierId: tierToSupport, message: supportMessage}
        }
        
        axios.post(`http://localhost:4941/api/v1/petitions/${id}/supporters`, data, {headers: {'X-Authorization': Cookies.get("X-Authorization")}})
        .then((response) => {
            setReload(reload * -1)
            setSnackMessage("You succesfully supported this petition")
            setSnackOpenSuccess(true)
            console.log("Success Support")
            setSupportMessage("")
        }, (error) => {
            setSnackMessage(error.response.statusText)
            setSnackOpenFail(true)
        })
    };

    const supportTierButtonHandler = (tierId: number) => {
        let result = '';
        supporters.forEach(supporter => {
            if (Number(supporter.supportTierId) === Number(tierId) && Number(supporter.supporterId) === Number(Cookies.get("userId"))) {
                result = 'Match';
            }
        });

        if (result === 'Match') {
            return (
                <Button variant="text" disabled>
                    You support this tier
                </Button>
            )
        }
        if (Number(Cookies.get('userId')) === petition?.ownerId) {
            return (
                <Button variant="text" disabled>
                    You own this petition
                </Button>
            )
        }

        if (Cookies.get('X-Authorization')) {
            return (
                <Button variant="outlined" onClick={() => handleSupportClickOpen(tierId)}>
                    Support Tier
                </Button>
            ) 
        } else {
            return (
                <Button variant="text" disabled>
                    Login / Register to support petitions
                </Button>
            )
        }
    }

    const handleSupportInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSupportMessage(event.target.value);
      };

    const supportTierButton = (tierId: number) => {
        return (
            <div key={tierId}>
                {supportTierButtonHandler(tierId)}
                <Dialog open={supportOpen} onClose={handleSupportClose}>
                    <DialogTitle>Confirm Support</DialogTitle>
                    <DialogContent>
                    <DialogContentText>
                        Are you sure you want to support this tier?
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Message"
                        type="text"
                        fullWidth
                        value={supportMessage}
                        onChange={handleSupportInputChange}
                    />
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={handleSupportClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => handleSupportConfirm()} color="primary" autoFocus>
                        Confirm
                    </Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
        
    }

    const supportersDisplay = () => {
        if (supporters.length === 0) {
            return
        } else {
            return (
                <div>
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
                </div>
            )
        }
    }

    const displayPetitionInfo = () => {
        return (
            <Container>
                {petition && (
                    <Card sx={{ marginTop: 4, marginBottom: '20px' }}>
                        <Typography variant="h2" component="h1" gutterBottom>
                            {petition.title}
                        </Typography>
                        <Grid container spacing={2}>
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
                                    <b>Created On:</b> {formattedDate}
                                </Typography>
                                <Typography variant="body1" paragraph align='left'>
                                    <b>Description:</b> {petition.description}
                                </Typography>
                                <Typography variant="body1" align='left'>
                                    <b>Money Raised:</b> ${petition.moneyRaised || "0"}
                                </Typography>
                                {displayEditButton(petition.ownerId)}
                                
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
                                                {supportTierButton(tier.supportTierId)}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                            {supportersDisplay()}
                        </CardContent>
                    </Card>
                )}
                {displaySimilarPetitions()}
                {modal()}
                {displaySnack()}
            </Container>
        );
    }

    if (redriect) {
        return (
            <Navigate to = {{ pathname: `/petitions` }} />
        )
    }

    if (editFlag) {
        return (
            <Navigate to = {{ pathname: `/petitions/${id}/edit` }} />
        )
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