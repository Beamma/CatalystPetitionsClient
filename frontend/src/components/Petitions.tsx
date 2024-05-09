import { Box, Chip, Dialog, FormControl, Grid, InputLabel, MenuItem, OutlinedInput, Paper, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Theme } from "@mui/material";
import axios from "axios";
import React from "react";
import NavBar from './NavBar';
import CSS from 'csstype';
import {useSearchStore} from "../store";

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


const Petitions = () => {
    const search = useSearchStore(state => state.search)
    const [petitions, setPetitions] = React.useState<petitionReturn>({petitions: [], count: 0});
    const [categories, setCategories] = React.useState<category[]>([]);
    const [supportTiers, setSupportTier] = React.useState<petitionSupportTiers[]>([]);
    const [filterCats, setFilterCats] = React.useState<String[]>([]);

    const updateFilterCats = (event: SelectChangeEvent<typeof filterCats>) => {
        const {
          target: { value },
        } = event;
        setFilterCats(
          // On autofill we get a stringified value.
          typeof value === 'string' ? value.split(',') : value,
        );
      };

    interface HeadCell {
        id: string;
        label: string;
        numeric: boolean;
    }
    
    const headCells: readonly HeadCell[] = [
        {id: 'Image', label: 'Image', numeric: false},
        { id: 'Title', label: 'Title', numeric: false },
        { id: 'CreationDate', label: 'Creation Date', numeric: false },
        { id: 'Category', label: 'Category', numeric: false },
        { id: 'Cost', label: 'Cost', numeric: false },
        { id: 'Owner', label: 'Owner', numeric: false },
    ];

    const card: CSS.Properties = {
        padding: "10px",
        margin: "20px",
    }

    React.useEffect(() => {
        getAllPetitions()
        getCategories()
    }, [search, filterCats])

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

    const getAllPetitions = () => {
        const parsedCatergories = parseCategories()

        if (search === "") {
            axios.get("http://localhost:4941/api/v1/petitions?count=10" + parsedCatergories)
            .then((reponse) => {
                setPetitions(reponse.data)
            })
        } else {
            axios.get("http://localhost:4941/api/v1/petitions?count=10&q=" + search + parsedCatergories)
            .then((reponse) => {
                setPetitions(reponse.data)
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

    const petition_rows = () => {
        return petitions.petitions.map((row: petition) =>
            <TableRow hover
                tabIndex={-1}
                key={row.petitionId}>
                <TableCell align="left"><img src={'http://localhost:4941/api/v1/petitions/' + row.petitionId +'/image'} width={150} height={150}></img></TableCell>
                <TableCell align="left">{row.title}</TableCell>
                <TableCell align="left">{row.creationDate}</TableCell>
                <TableCell align="left">{getCategoryName(row.categoryId)}</TableCell>
                <TableCell align="left">{row.supportingCost}</TableCell>
                <TableCell align="left">{row.ownerFirstName} {row.ownerLastName} <img src={'http://localhost:4941/api/v1/users/' + row.ownerId +'/image'} width={50} height={50} style={{ borderRadius: '50%' }} alt='Hero'></img></TableCell>
            </TableRow>
        )
    }

    const FilterCategories = () => {
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

    return (
        <div>
            <NavBar></NavBar>
            <Paper style={card}>
                <h3>Filter</h3>
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <FilterCategories />
                    </Grid>
                </Grid>
            </Paper>
            <Paper elevation={3} style={card}>
                <h1>Petitions</h1>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {headCells.map((headCell) => (
                                    <TableCell
                                        key={headCell.id}
                                        padding={'normal'}>
                                        {headCell.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                    <TableBody>
                        {petition_rows()}
                    </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </div>
    )
}

export default Petitions;