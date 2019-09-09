const directives = `
    directive @relation(onDelete: Relation = SET_NULL) on FIELD_DEFINITION | FIELD
    directive @default(value: String) on FIELD_DEFINITION | FIELD
`

module.exports = directives