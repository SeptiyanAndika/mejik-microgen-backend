import { merge } from 'lodash'
import config from '../config.json'
import { typeDef as Example, resolvers as exampleResolvers } from './graphql/example'

import { ApolloServer, makeExecutableSchema, gql } from 'apollo-server';
import { GraphQLScalarType } from 'graphql';
import GraphQLJSON from 'graphql-type-json';


const cote = require('cote')({ redis: { host: 'localhost', port: "6379" } })

const typeDefs = gql`
    type Query { anything: String }
    scalar JSON
    scalar Date
`
const resolver = {
    JSON: GraphQLJSON,
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize(value) {
            return new Date(value).toString() // value sent to the client
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return parseInt(ast.value, 10); // ast value is always in string format
            }
            return null;
        },
    }),
}

const schema = makeExecutableSchema({
    typeDefs: [ typeDefs, User, Event, Ticket, Order],
    resolvers: merge(resolver, userResolvers, eventResolver, ticketResolver, orderResolver),
});


const eventRequester = new cote.Requester({ 
    name: 'Event Requester', 
    key: 'event',
})
const orderRequester = new cote.Requester({ 
    name: 'Order Requester', 
    key: 'order',
})
const ticketRequester = new cote.Requester({ 
    name: 'Event Requester', 
    key: 'ticket',
})

const userRequester = new cote.Requester({ 
    name: 'User Requester', 
    key: 'user',
})


const context = ({req}) => {
    return {
        headers: req.headers,
        eventRequester,
        orderRequester,
        ticketRequester,
        userRequester
    }
}
const server = new ApolloServer({
    schema, 
    context
})

server.listen().then(({url})=>{
    console.log(`🚀  Server ready at ${url}`)
})