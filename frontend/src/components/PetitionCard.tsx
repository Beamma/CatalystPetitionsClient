import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Avatar, Box, Button, Chip, IconButton } from '@mui/material';
import { white } from 'material-ui/styles/colors';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Cookies from 'js-cookie';
import { Navigate, useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();
    const color = numberToRGB(categoryId);
    const chipStyle: React.CSSProperties = {
      backgroundColor: color,
    };

    const editPetition = () => {
        const url = `/petitions/${petitionId}/edit`
        console.log(url)
        navigate(url);
    }

    React.useEffect(() => {

    }, [])

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(new Date(creationDate));

    const displayCardButtons = () => {
        if (ownerId === Number(Cookies.get("userId"))) {
            return (
                <div>
                    <IconButton >
                        <DeleteIcon />
                    </IconButton>
                    <IconButton onClick={editPetition}>
                        <EditIcon />
                    </IconButton>
                </div>
            )
        } else {
            return
        }
    }

    const linkStyle = {
        textDecoration: 'none',
        color: 'inherit',
    };
    
    
    return (
        <Card sx={{ marginBottom: 2 }}>
          <a href={`/petitions/${petitionId}`} style={linkStyle}>
          {imageUrl && (
            <CardMedia
              component="img"
              height="140"
              image={imageUrl}
              alt={`${title} image`}
            />
          )}
          <CardContent>
            <Box display="flex" alignItems="center">
              {ownerProfilePictureUrl && (
                <Avatar alt={`${ownerFirstName} ${ownerLastName}`} src={ownerProfilePictureUrl} sx={{ marginRight: 2 }} />
              )}
              <Box>
                <Typography variant="h5" component="div">
                  {title}
                </Typography>
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
            <Typography variant="body2" color="text.secondary">
                <Chip label={categoryName} variant="filled" sx={{backgroundColor: numberToRGB(categoryId), color: "white"}}></Chip>
            </Typography>
          </CardContent>
          </a>
          {displayCardButtons()}
        </Card>
    );
  }

export default PetitionCard;