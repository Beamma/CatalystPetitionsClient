import { TableFooter, Box, Chip, FormControl, Grid, InputLabel, MenuItem, OutlinedInput, Pagination, Paper, Select, SelectChangeEvent, Slider, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Container } from "@mui/material";
import axios from "axios";
import React from "react";
import NavBar from './NavBar';
import CSS from 'csstype';
import {useSearchStore} from "../store";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import PetitionCard from "./PetitionCard";
import Cookies from "js-cookie";

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
    const search = useSearchStore(state => state.search)
    const [filterCats, setFilterCats] = React.useState<String[]>([]);
    const [filteredCost, setFilteredCost] = React.useState<number>(100);
    const [sort, setSort] = React.useState('');
    const [petitionCount, setPetitionCount] = React.useState(0);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [petitions, setPetitions] = React.useState<Petition[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);

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
    }, [search, filterCats, filteredCost, sort, page, rowsPerPage])

    React.useEffect(() => {
        setPage(0)
        fetchPetitions()
    }, [search, filterCats, filteredCost, sort])

    const fetchPetitions = async () => {
        try {
            const parsedCatergories = parseCategories()
            const parsedCost = parseCost()
            const parsedSearch = parseSearch()

            const url = "http://localhost:4941/api/v1/petitions?count=" + rowsPerPage + parsedCatergories + parsedCost + sort + "&startIndex=" + (rowsPerPage * page) + parsedSearch

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
        if (search === "") {
            return ""
        } else {
            return `&q=${search}`
        }
    }

    const parseCategories = () => {
        let resultString = ""
        filterCats.map((cat: String) =>
            {
                const categoryId = categories.find(category => category.name === cat);
                resultString = resultString + "&categoryIds=" +categoryId?.categoryId
            }
        ) 
        return (resultString)
    }

    const parseCost = () => {
        if (filteredCost === undefined) {
            return ""
        }
        let resultString = "&supportingCost=" + filteredCost.toString()
        return resultString
    }

    const getAllPetitions = () => {
        const parsedCatergories = parseCategories()
        const parsedCost = parseCost()

        if (search === "") {
            axios.get("http://localhost:4941/api/v1/petitions?count=" + rowsPerPage + parsedCatergories + parsedCost + sort + "&startIndex=" + (rowsPerPage * page))
            .then((reponse) => {
                setPetitions(reponse.data)
                setPetitionCount(reponse.data.count)
            })
        } else {
            axios.get("http://localhost:4941/api/v1/petitions?count=" + rowsPerPage + "&q=" + search + parsedCatergories + parsedCost + sort + "&startIndex=" + (rowsPerPage * page))
            .then((reponse) => {
                setPetitions(reponse.data)
                setPetitionCount(reponse.data.count)
            })
        }
        
    }

    const getCategories = () => {
        axios.get("http://localhost:4941/api/v1/petitions/categories")
            .then((reponse) => {
                setCategories(reponse.data)
            })
    }

    function getCategoryName(categoryId: number): string | undefined {
        const category = categories.find(category => category.categoryId === categoryId);
        return category ? category.name : undefined;
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
                    {selected.map((value) => (
                        <Chip label={value} />
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

    const handleFilterCostChange = (event: Event, newValue: number | number[]) => {
        setFilteredCost(newValue as number);
      };

    const filterCost = () => {
        return (
            <FormControl fullWidth>
                Support Tier Cost
                <Slider aria-label="Default" valueLabelDisplay="auto" onChange={handleFilterCostChange} value={filteredCost} />
            </FormControl>
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
                    <MenuItem value={"&sortBy=CREATED_ASC"}>Creadted (Oldest First)<ArrowDropUpIcon /></MenuItem>
                    <MenuItem value={"&sortBy=CREATED_DESC"}>Created (Newest First)<ArrowDropDownIcon /></MenuItem>
                </Select>
            </FormControl>
        )
    }

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
        ) => {
            setPage(newPage);
            
        };
    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        };

    const pagination = () => {
        return (
            
                <TablePagination
                component="div"
                count={petitionCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                showFirstButton
                showLastButton
                rowsPerPageOptions={[5, 6, 7, 8, 9, 10]}
                />
            
          );
    }

    return (
        <div>
            <NavBar></NavBar>
            <Paper style={card}>
                <h3>Filter</h3>
                <Grid container spacing={20}>
                    <Grid item xs={4}>
                        {filterCategories()}
                    </Grid>
                    <Grid item xs={4}>
                        {filterCost()}
                    </Grid>
                    <Grid item xs={4}>
                        {sortPetitions()}
                    </Grid>
                </Grid>
            </Paper>
                <h1>Petitions</h1>
                <Container maxWidth="xl">
                    <Grid container spacing={3}>
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
                    {pagination()}
                </Container>
        </div>
    )
}

export default Petitions;