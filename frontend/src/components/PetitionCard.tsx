import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Alert, Avatar, Box, Button, CardActionArea, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Snackbar } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface PetitionCardProps {
    title: string;
    ownerFirstName: string;
    ownerLastName: string;
    numberOfSupporters: number;
    creationDate: string;
    imageUrl: string;
    categoryName: string;
    ownerProfilePictureUrl?: string;
    supportingCost: number,
    categoryId: number,
    petitionId: number,
    ownerId: number
}

const numberToRGB = (num: number): string => {
    const r = (num*137.5) % 360
    return `hsl(${r},100%, 40%)`;
};

const PetitionCard: React.FC<PetitionCardProps> = ({ title, ownerFirstName, ownerLastName, numberOfSupporters, creationDate, imageUrl, categoryName, ownerProfilePictureUrl, supportingCost, categoryId, petitionId, ownerId }) => {
    const [snackOpenSuccess, setSnackOpenSuccess] = React.useState(false)
    const [snackMessage, setSnackMessage] = React.useState("")
    const [snackOpenFail, setSnackOpenFail] = React.useState(false)
    const navigate = useNavigate();
    const editPetition = () => {
        const url = `/petitions/${petitionId}/edit`
        navigate(url);
    }
    const [open, setOpen] = useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    useEffect(() => {

    }, [])

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

  const displaySnack = (id: number) => {
      return (
          <div>
              <Snackbar
                  autoHideDuration={6000}
                  open={snackOpenSuccess}
                  onClose={handleSnackCloseSuccess}
                  key={"Success" + id}>
                  <Alert onClose={handleSnackCloseSuccess} severity="success" sx={{width: '100%'}}>
                      {snackMessage}
                  </Alert>
              </Snackbar>
              <Snackbar
                  autoHideDuration={6000}
                  open={snackOpenFail}
                  onClose={handleSnackCloseFail}
                  key={"Fail" + id}>
                  <Alert onClose={handleSnackCloseFail} severity="error" sx={{width: '100%'}}>
                      {snackMessage}
                  </Alert>
              </Snackbar>
          </div>
      )
  }

    const handleDelete = () => {
        // Add your delete logic here
        axios.delete(`http://localhost:4941/api/v1/petitions/${petitionId}`, {headers: {'X-Authorization': Cookies.get("X-Authorization")}})
        .then((response) => {
            window.location.reload()
        }, (error) => {
            setSnackMessage(error.response.statusText)
            setSnackOpenFail(true)
        })
        handleClose();
    };

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(creationDate));

    const displayCardButtons = () => {
        if (ownerId === Number(Cookies.get("userId"))) {
            if (numberOfSupporters === 0) {
                return (
                    <div>
                        <IconButton onClick={handleClickOpen}>
                            <DeleteIcon />
                        </IconButton>
                        <IconButton onClick={editPetition}>
                            <EditIcon />
                        </IconButton>
                    </div>
                )
            } else {
                return (
                    <div>
                        <IconButton onClick={handleClickOpen} disabled>
                            <DeleteIcon />
                        </IconButton>
                        <IconButton onClick={editPetition}>
                            <EditIcon />
                        </IconButton>
                    </div>
                )
            }
        } else {
            return
        }
    }
    
    const linkToPetition = () => {
        navigate(`/petitions/${petitionId}`)
    }

    return (
        <div>
            <Card sx={{ marginBottom: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 500  }}>
                <CardActionArea onClick={linkToPetition}>
                    <Box sx={{ flexGrow: 1 }}>
                        {imageUrl && (
                            <CardMedia
                            component="img"
                            height="250"
                            image={imageUrl}
                            alt={`${title} image`}
                            />
                        )}
                        <CardContent sx={{ paddingBottom: '0 !important' }}>
                            <Typography variant="h5" component="div">
                                {title}
                            </Typography>
                            <Box display="flex" alignItems="center" justifyContent={'center'}>
                                {ownerProfilePictureUrl && (
                                    <Avatar alt={`${ownerFirstName} ${ownerLastName}`} src={ownerProfilePictureUrl} sx={{ marginRight: 2 }} />
                                )}
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                    {ownerFirstName} {ownerLastName}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                            Supporters: {numberOfSupporters}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                            Created on: {formattedDate}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Cost: ${supportingCost}
                            </Typography>
                            <Chip label={categoryName} variant="filled" sx={{backgroundColor: numberToRGB(categoryId), color: "white"}}></Chip>
                        </CardContent>
                    </Box>
                </CardActionArea>
                <Box>
                    {displayCardButtons()}
                </Box>
            </Card>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                key={petitionId}
            >
                <DialogTitle id="alert-dialog-title">{"Are you sure you want to delete this petition?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" variant='outlined'>
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="primary" variant='contained' autoFocus>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
            {displaySnack(petitionId)}
        </div>
    );
  }

export default PetitionCard;