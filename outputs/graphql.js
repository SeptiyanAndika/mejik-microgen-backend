import { REDIS_HOST, REDIS_PORT, APP_NAME, S3_BUCKET_NAME, GRAPHQL_PORT, GRAPHQL_PLAYGROUND } from './config'
import { merge } from 'lodash'
import express from 'express'
import http from 'http'
import { ApolloServer, makeExecutableSchema, gql, GraphQLUpload, UserInputError } from 'apollo-server-express'
import { createRateLimitTypeDef, createRateLimitDirective, defaultKeyGenerator } from 'graphql-rate-limit-directive'
import { GraphQLScalarType, Kind } from 'graphql'
import GraphQLJSON from 'graphql-type-json'

import { PubSub } from 'graphql-subscriptions'
import { typeDef as User, resolvers as userResolvers } from './graphql/user'
import { typeDef as Email, resolvers as emailResolvers } from './graphql/email'
import { typeDef as PushNotification, resolvers as pushNotificationResolvers } from './graphql/pushNotification'
import moment from 'moment'
import { typeDef as Workspace, resolvers as workspaceResolvers } from './graphql/workspace'
import { typeDef as Project, resolvers as projectResolvers } from './graphql/project'
import { typeDef as Server, resolvers as serverResolvers } from './graphql/server'
const { injectConfigFromHook } = require('./utils/hookGraphql')
const pubSub = new PubSub()
const Prometheus = require('./monitor')

const cote = require('cote')({ redis: { host: REDIS_HOST, port: REDIS_PORT } })
const typeDefs = gql `
   type Query { default: String }
   type Response { message: String }
   type Mutation { default: String }
   type Subscription { default: String }
	enum Role{
ADMIN
AUTHENTICATED
}
enum Relation{
CASCADE
SET_NULL
RESTRICT
}
   scalar Timestamp
   scalar JSON
   scalar Upload
   scalar DateTime
   scalar Date
`
const resolver = {
    JSON: GraphQLJSON,
    Upload: GraphQLUpload,
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize(value) {
            let date = new Date(value)
            return moment(date).format('DD-MM-YYYY')
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return parseInt(ast.value, 10); // ast value is always in string format
            }
            if (ast.kind === Kind.STRING) {
                let date = new Date(ast.value)
                return date
            }
            return null;
        },
    }),
    DateTime: new GraphQLScalarType({
        name: 'DateTime',
        description: 'DateTime custom scalar type',
        parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize(value) {
            return new Date(value) // value sent to the client
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return parseInt(ast.value, 10); // ast value is always in string format
            }
            if (ast.kind === Kind.STRING) {
                return ast.value
            }
            return null;
        },
    }),
    Timestamp: new GraphQLScalarType({
        name: 'Timestamp',
        serialize(value) {
            return new Date(value).getTime() // value sent to the client
        },
        parseValue(value) {
            try {

                let valid = new Date(value).getTime() > 0;
                if (!valid) {
                    throw new UserInputError("Date is not valid")
                }
                return value
            } catch (error) {
                console.log("err", error)
                throw new UserInputError("Date is not valid")
            }
        },
        parseLiteral(ast) {
            try {
                let valid = new Date(Number(ast.value)).getTime() > 0;
                if (!valid) {
                    throw new UserInputError("Date is not valid")
                }
                return ast.value
            } catch (error) {
                console.log("err", error)
                throw new UserInputError("Date is not valid")
            }
        },
    })
}
const schema = makeExecutableSchema({
    typeDefs: [typeDefs, createRateLimitTypeDef(), injectConfigFromHook("user", User), injectConfigFromHook("email", Email), injectConfigFromHook("pushNotification", PushNotification), injectConfigFromHook('workspace', Workspace), injectConfigFromHook('project', Project), injectConfigFromHook('server', Server)],
    resolvers: merge(resolver, userResolvers, emailResolvers, pushNotificationResolvers, workspaceResolvers({ pubSub }), projectResolvers({ pubSub }), serverResolvers({ pubSub })),
    schemaDirectives: {
        rateLimit: createRateLimitDirective({
            keyGenerator
        }),
    },
});

const userRequester = new cote.Requester({
    name: 'User Requester',
    key: 'user',
})

const storageRequester = new cote.Requester({
    name: 'Storage Requester',
    key: 'storage',
})

const emailRequester = new cote.Requester({
    name: 'Email Requester',
    key: 'email',
})

const pushNotificationRequester = new cote.Requester({
    name: 'Push Notification Requester',
    key: 'pushNotification',
})

const workspaceRequester = new cote.Requester({
    name: 'Workspace Requester',
    key: 'workspace',
})

const projectRequester = new cote.Requester({
    name: 'Project Requester',
    key: 'project',
})

const serverRequester = new cote.Requester({
    name: 'Server Requester',
    key: 'server',
})

const uuid = () => {
    return Math.random().toString(36).substring(7)
}


const keyGenerator = (directiveArgs, obj, args, context, info) =>
    `${context.ip}:${defaultKeyGenerator(         obj,
         args,
         context,
         directiveArgs,
      )}`
const parseBearerToken = (headers) => {
    return Object.assign(headers, {
        authorization: headers.authorization ? headers.authorization.split(" ")[1] : null
    })
}

const context = ({ req, connection }) => {
    return {
        bucket: S3_BUCKET_NAME,
        uuid,
        ip: req ? req.ip : '',
        storageUrl: "https://" + S3_BUCKET_NAME + ".s3-ap-southeast-1.amazonaws.com/",
        headers: !connection && parseBearerToken(req.headers),
        userRequester,
        storageRequester,
        emailRequester,
        pushNotificationRequester,
        workspaceRequester,
        projectRequester,
        serverRequester
    }
}

const server = new ApolloServer({
    schema,
    context,
    playground: GRAPHQL_PLAYGROUND === "true",
})

const app = express();

app.use(Prometheus.requestCounters);
app.use(Prometheus.responseCounters);

/**
 * Enable metrics endpoint
 */
Prometheus.injectMetricsRoute(app);

/**
 * Enable collection of default metrics
 */

Prometheus.startCollection();
server.applyMiddleware({ app });

const httpServer = http.createServer(app);

server.installSubscriptionHandlers(httpServer);

httpServer.listen(GRAPHQL_PORT, () => {
    console.log('🚀 Server ready at http://localhost:' + GRAPHQL_PORT + server.graphqlPath)
    console.log('🚀 Subscriptions ready at ws://localhost:' + GRAPHQL_PORT + server.subscriptionsPath)
})