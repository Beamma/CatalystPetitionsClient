import { TableCell, TableRow } from "@mui/material";
import axios from "axios";
import React from "react";

const Petitions = () => {

    const [petitions, setPetitions] = React.useState<Array<Petition>>([]);

    React.useEffect(() => {
        getAllPetitions()
    }, [])

    const getAllPetitions = () => {
        axios.get("http://localhost:4941/api/v1/petitions")
            .then((reponse) => {
                console.log(reponse.data)
                setPetitions(reponse.data)
            })
    }

    const petition_rows = () => {
        return petitions.map((row: Petition) =>
            <TableRow
                key={row.petitionId}>
                <TableCell>
                    {row.petitionId}
                </TableCell>
                <TableCell align="right">{row.title}</TableCell>
            </TableRow>
        )
        }

    return (
        <div>
            <h1> Petitions </h1>
            <ul>
                {/* {petitions.map(petition => (
                    <li key={petition.petitionId}>{petition.title}</li>
                ))} */}
            </ul>
        </div>
    )
}

export default Petitions;