import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Avatar, Box } from '@mui/material';

interface PetitionCardProps {
    title: string;
    ownerFirstName: string;
    ownerLastName: string;
    numberOfSupporters: number;
    creationDate: string;
    imageUrl: string;
    categoryName: string;
    ownerProfilePictureUrl?: string;
    supportingCost: number
}

const PetitionCard: React.FC<PetitionCardProps> = ({ title, ownerFirstName, ownerLastName, numberOfSupporters, creationDate, imageUrl, categoryName, ownerProfilePictureUrl, supportingCost }) => {
    return (
      <Card sx={{ marginBottom: 2 }}>
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
                Category: {categoryName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                By: {ownerFirstName} {ownerLastName}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Supporters: {numberOfSupporters}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Created on: {new Date(creationDate).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
                Cost: ${supportingCost}
          </Typography>
        </CardContent>
      </Card>
    );
  }

export default PetitionCard;