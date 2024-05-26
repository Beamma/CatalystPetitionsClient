import { Box, Chip, FormControl, Grid, InputLabel, MenuItem, OutlinedInput, Pagination, Paper, Select, SelectChangeEvent, Slider, Container, SliderProps, TextField, InputAdornment, Typography, Button } from "@mui/material";
import axios from "axios";
import React, { ChangeEvent } from "react";
import NavBar from './NavBar';
import CSS from 'csstype';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import PetitionCard from "./PetitionCard";
import SearchIcon from '@mui/icons-material/Search';

const POS_TAG_HEIGHT = 48;
const POS_TAG_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: POS_TAG_HEIGHT * 4.5 + POS_TAG_PADDING_TOP,
        width: 250,
      },
    },
};

interface Petition {
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

interface PetitionsResponse {
    petitions: Petition[];
    count: number;
}

interface Category {
    categoryId: number;
    name: string;
}

const Petitions = () => {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [filterCats, setFilterCats] = React.useState<String[]>([]);
    const [filteredCost, setFilteredCost] = React.useState<number>(100);
    const [dynamicFilteredCost, setDynamicFilteredCost] = React.useState<number>(100)
    const [sort, setSort] = React.useState('');
    const [petitionCount, setPetitionCount] = React.useState(0);
    const [page, setPage] = React.useState(1);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [petitions, setPetitions] = React.useState<Petition[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [sliderEnabled, setSliderEnabled] = React.useState(true);

    const toggleSlider = () => {
        setSliderEnabled(!sliderEnabled);
    };

    const updateFilterCats = (event: SelectChangeEvent<typeof filterCats>) => {
        const {
          target: { value },
        } = event;
        setFilterCats(
          // On autofill we get a stringified value.
          typeof value === 'string' ? value.split(',') : value,
        );
      };

    const card: CSS.Properties = {
        padding: "10px",
        margin: "20px",
    }
    React.useEffect(() => {
        fetchPetitions()
    })

    React.useEffect(() => {

    }, [searchQuery, filterCats, filteredCost, sort, page, rowsPerPage, sliderEnabled])

    React.useEffect(() => {
        setPage(1)
    }, [searchQuery, filterCats, filteredCost, sort, rowsPerPage, sliderEnabled])

    const fetchPetitions = async () => {
        try {
            const parsedCatergories = parseCategories()
            const parsedCost = parseCost()
            const parsedSearch = parseSearch()

            const url = "http://localhost:4941/api/v1/petitions?count=" + rowsPerPage + parsedCatergories + parsedCost + sort + "&startIndex=" + (rowsPerPage * (page-1)) + parsedSearch

            const [petitionsResponse, categoriesResponse] = await Promise.all([
                axios.get<PetitionsResponse>(url),
                axios.get<Category[]>('http://localhost:4941/api/v1/petitions/categories/')
            ]);
            
            setPetitionCount(petitionsResponse.data.count)

            const petitionsData = petitionsResponse.data.petitions;
            const categoriesData = categoriesResponse.data;
            setCategories(categoriesResponse.data)

            const petitionsWithCategories = await Promise.all(petitionsData.map(async (petition) => {
                const ownerProfilePictureUrl = `http://localhost:4941/api/v1/users/${petition.ownerId}/image`
                const category = categoriesData.find(cat => cat.categoryId === petition.categoryId);
                return { ...petition, ownerProfilePictureUrl, categoryName: category ? category.name : 'Unknown' };
            }));

              setPetitions(petitionsWithCategories);
        } catch (error) {
              console.error('Error fetching petitions or categories:', error);
        }
    }

    const parseSearch = () => {
        if (searchQuery === "") {
            return ""
        } else {
            return `&q=${searchQuery}`
        }
    }

    const parseCategories = () => {
        let resultString = ""
        filterCats.forEach((cat: String) =>
            {
                const categoryId = categories.find(category => category.name === cat);
                resultString = resultString + "&categoryIds=" +categoryId?.categoryId
            }
        ) 
        return (resultString)
    }

    const parseCost = () => {
        if (!sliderEnabled) {
            return ""
        }
        if (filteredCost === undefined) {
            return ""
        }
        let resultString = "&supportingCost=" + filteredCost.toString()
        return resultString
    }

    const filterCategories = () => {
        return (
            <FormControl fullWidth>
                <InputLabel id="demo-multiple-chip-label">Categories</InputLabel>
                <Select
                labelId="demo-multiple-chip-label"
                id="demo-multiple-chip"
                multiple
                value={filterCats}
                onChange={updateFilterCats}
                input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value, index) => (
                        <Chip label={value} key={`${value}-${index}`}/>
                    ))}
                    </Box>
                )}
                MenuProps={MenuProps}
                >
                {categories.map((pos) => (
                    <MenuItem
                    key={pos.name}
                    value={pos.name}
                    >
                    {pos.name}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
        )
    }

    const handleFilterCostChange: SliderProps['onChangeCommitted'] = (
        event: React.SyntheticEvent | Event,
        value: number | number[]
    ) => {
        setFilteredCost(value as number);
    };

    const handleDynamicCost = (event: Event, newValue: number | number[]) => {
        setDynamicFilteredCost(newValue as number);
    };


    const filterCost = () => {
        return (
            <FormControl fullWidth>
                Support Tier Cost
                <Slider aria-label="Default" valueLabelDisplay="auto" onChangeCommitted={handleFilterCostChange} value={dynamicFilteredCost} onChange={handleDynamicCost} disabled={!sliderEnabled}/>
                <Button
                    size="small"
                    variant="contained"
                    onClick={toggleSlider}
                    sx={{ marginBottom: '10px' }}
                >
                    {sliderEnabled ? 'Show All' : 'Filter By Cost'}
                </Button>
            </FormControl>
        )
    }

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value)
    }

    const searchPetitions = () => {

        return (
            <TextField
                style={{ width: "100%" }}
                label="Search Petitions"
                variant="outlined"
                value={searchQuery}
                onChange={handleSearch}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                                <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />
        )
    }
    const changeSort = (event: SelectChangeEvent) => {
        setSort(event.target.value as string);
    };

    const sortPetitions = () => {
        return (
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Sort</InputLabel>
                <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={sort}
                label="Sort"
                onChange={changeSort}
                >
                    <MenuItem value={"&sortBy=ALPHABETICAL_ASC"}>Alphabetical (A-Z)<ArrowDropUpIcon /></MenuItem>
                    <MenuItem value={"&sortBy=ALPHABETICAL_DESC"}>Alphabetical (Z-A)<ArrowDropDownIcon /></MenuItem>
                    <MenuItem value={"&sortBy=COST_ASC"}>Cost (Low to High)<ArrowDropUpIcon /></MenuItem>
                    <MenuItem value={"&sortBy=COST_DESC"}>Cost (High to Low)<ArrowDropDownIcon /></MenuItem>
                    <MenuItem value={"&sortBy=CREATED_ASC"}>Created (Oldest First)<ArrowDropUpIcon /></MenuItem>
                    <MenuItem value={"&sortBy=CREATED_DESC"}>Created (Newest First)<ArrowDropDownIcon /></MenuItem>
                </Select>
            </FormControl>
        )
    }

    const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };    
    
    const handleChangeRowsPerPage = (event: SelectChangeEvent) => {
        setRowsPerPage(Number(event.target.value))

      };

    const pagination = () => {
        return (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center'}}>
                    <FormControl size="small">
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={rowsPerPage.toString()}
                            onChange={handleChangeRowsPerPage}
                            size="small"
                        >
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={6}>6</MenuItem>
                            <MenuItem value={7}>7</MenuItem>
                            <MenuItem value={8}>8</MenuItem>
                            <MenuItem value={9}>9</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                        </Select>
                    </FormControl>
                    <Pagination 
                        count={Math.floor((petitionCount-1)/rowsPerPage)+1} 
                        page={page} 
                        onChange={handleChangePage}
                        showFirstButton
                        showLastButton
                    />
                </div>
          );
    }

    const displayPetitions = () => {
        if (petitionCount === 0) {
            return (
                <div>
                    <Typography variant="h2" gutterBottom sx={{ 
                        margin: '200px',
                        marginBottom: '20px'
                    }}>
                        No petitions to display
                    </Typography>
                    <Typography sx={{fontStyle: 'italic', marginBottom: '200px'}}>
                        There are no petitions to mathc your filter options
                    </Typography>
                </div>
            )
        }
        return (
            <Grid container spacing={3} >
                {petitions.map((petition) => (
                    <Grid item xs={12} sm={6} md={3} key={petition.petitionId}>
                        <PetitionCard
                            key={petition.petitionId}
                            title={petition.title}
                            ownerFirstName={petition.ownerFirstName}
                            ownerLastName={petition.ownerLastName}
                            numberOfSupporters={petition.numberOfSupporters}
                            creationDate={petition.creationDate}
                            imageUrl={`http://localhost:4941/api/v1/petitions/${petition.petitionId}/image` || ''}
                            categoryName={petition.categoryName || 'Unknown'}
                            ownerProfilePictureUrl={petition.ownerProfilePictureUrl || ''}
                            supportingCost={petition.supportingCost}
                            categoryId={petition.categoryId}
                            petitionId={petition.petitionId}
                            ownerId={petition.ownerId}
                        />
                    </ Grid>
                ))}
            </Grid>
        )
    }

    return (
        <div>
            <NavBar></NavBar>
            <Paper style={card}>
                <h3>Filter</h3>
                <Grid container spacing={20}>
                    <Grid item xs={3}>
                        {searchPetitions()}
                    </Grid>
                    <Grid item xs={3}>
                        {filterCost()}
                    </Grid>
                    <Grid item xs={3}>
                        {filterCategories()}
                    </Grid>
                    <Grid item xs={3}>
                        {sortPetitions()}
                    </Grid>
                </Grid>
            </Paper>
                <h1>Petitions</h1>
                <Container maxWidth="xl" style={{ display: 'flex', flexDirection: 'column', paddingBottom: '20px' }}>
                    {displayPetitions()}
                    {pagination()}
                </Container>
        </div>
    )
}

export default Petitions;