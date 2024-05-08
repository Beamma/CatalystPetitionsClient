type Petition = {
    /**
    * User id as defined by the database
    */
    petitionId: number,
    /**
    * Users username as entered when created
    */
    title: string,
    categoryId: number,
    ownerId: number,
    ownerFirstName: string,
    ownerLastName: string,
    numberOfSupporter: number,
    creationDate: Date,
    supportingCost: number
}