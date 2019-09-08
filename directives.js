const { ApolloServer, gql, SchemaDirectiveVisitor } = require('apollo-server');
const { defaultFieldResolver } = require('graphql');
class UpperCaseDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field) {
        const { resolve = defaultFieldResolver } = field;
        field.resolve = async function (...args) {
        const result = await resolve.apply(this, args);
        if (typeof result === 'string') {
            return result.toUpperCase();
        }
        return result;
        };
    }
}

module.exports = {
    UpperCaseDirective
}