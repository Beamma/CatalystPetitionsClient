import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Avatar, Box, Chip } from '@mui/material';

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
    categoryId: number
}

const numberToRGB = (num: number): string => {
    const r = (num*137.5) % 256
    const g = (num*137.5) % 256
    const b = (num*137.5) % 256
    return `rgb(${r},${g},${b})`;
};

const PetitionCard: React.FC<PetitionCardProps> = ({ title, ownerFirstName, ownerLastName, numberOfSupporters, creationDate, imageUrl, categoryName, ownerProfilePictureUrl, supportingCost, categoryId }) => {
    const color = numberToRGB(categoryId);
    const chipStyle: React.CSSProperties = {
      backgroundColor: color,
    };

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(new Date(creationDate));
    
    
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
                <Chip label={categoryName} variant="filled" sx={{backgroundColor: numberToRGB(categoryId)}}></Chip>
            </Typography>
        </CardContent>
      </Card>
    );
  }

export default PetitionCard;