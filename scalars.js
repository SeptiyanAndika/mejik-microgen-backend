const { gql } = require("apollo-server")

const scalars = gql`
    scalar JSON
    scalar Date
`

module.exports = scalars