const scalars = `
    scalar JSON
    scalar Date
    scalar Timestamp

    enum Relation{
        CASCADE
        SET_NULL
        RESTRICT
    }
`

module.exports = scalars