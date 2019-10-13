export const typeDef = `
    type Server {
       id: String 
       name: String 
       ip: String 
       projects (query: JSON): [Project] 
       editor: String 
       status: String 
       description: String 
       os: String 
       users (query: JSON): [User] 
       createdBy: User
       updatedBy: User
       createdAt: DateTime
       updatedAt: DateTime
    }
    type ServerConnection {
       total: Int 
       limit: Int 
       skip: Int 
       data: [Server] 
    }

    extend type Query {
        servers (query: JSON): [Server]
        server (id: String!): Server
        serversConnection (query: JSON): ServerConnection
    } 

    input ServerCreateInput {
       name : String!
       ip : String!
       editor : String!
       status : String
       description : String
       os : String
    }

    input ServerUpdateInput {
       name : String!
       ip : String!
       editor : String!
       status : String
       description : String
       os : String
    }

    extend type Subscription {
       serverAdded: Server
       serverUpdated: Server
       serverDeleted: Server
    }
    extend type Mutation {
       createServer(input: ServerCreateInput): Server
       updateServer(input: ServerUpdateInput, id: String): Server
       deleteServer(id: String): Server
    }
`
export const resolvers = ({ pubSub }) => ({
    Query: {
        servers: async (_, { query }, { workspaceRequester, projectRequester, serverRequester, headers }) => {
            if (query && query.id) {
                query._id = query.id
                delete query.id
            }
            try {
                return await serverRequester.send({ type: 'find', query, headers })
            } catch (e) {
                throw new Error(e)
            }
        },
        server: async (_, { id }, { workspaceRequester, projectRequester, serverRequester, headers }) => {
            try {
                return await serverRequester.send({ type: 'get', id, headers })
            } catch (e) {
                throw new Error(e)
            }
        },
        serversConnection: async (_, { query }, { workspaceRequester, projectRequester, serverRequester, headers }) => {
            if (query && query.id) {
                query._id = query.id
                delete query.id
            }
            try {
                return await serverRequester.send({ type: 'findConnection', query, headers })
            } catch (e) {
                throw new Error(e)
            }
        },
    },
    Server: {
        createdBy: async ({ createdBy }, args, { headers, userRequester }) => {
            try {
                return await userRequester.send({ type: 'get', id: createdBy, headers })
            } catch (e) {
                throw new Error(e)
            }
        },
        updatedBy: async ({ updatedBy }, args, { headers, userRequester }) => {
            try {
                return await userRequester.send({ type: 'get', id: updatedBy, headers })
            } catch (e) {
                throw new Error(e)
            }
        },
        projects: async ({ id }, { query }, { headers, projectRequester }) => {
            try {
                return await projectRequester.send({ type: 'find', query: Object.assign({ serverId: id }, query), headers })
            } catch (e) {
                throw new Error(e)
            }
        },
        users: async ({ id }, { query }, { headers, userRequester }) => {
            try {
                return await userRequester.send({ type: 'find', query: Object.assign({ serverId: id }, query), headers })
            } catch (e) {
                throw new Error(e)
            }
        },
    },
    Subscription: {
        serverAdded: {
            subscribe: () => pubSub.asyncIterator('serverAdded')
        },
        serverUpdated: {
            subscribe: () => pubSub.asyncIterator('serverUpdated')
        },
        serverDeleted: {
            subscribe: () => pubSub.asyncIterator('serverDeleted')
        },
    },
    Mutation: {
        createServer: async (_, { input = {} }, { workspaceRequester, projectRequester, serverRequester, headers }) => {
            try {
                let data = await serverRequester.send({ type: 'create', body: input, headers })
                pubSub.publish("serverAdded", { serverAdded: data })
                return data
            } catch (e) {
                throw new Error(e)
            }
        },
        updateServer: async (_, { input = {}, id }, { workspaceRequester, projectRequester, serverRequester, headers }) => {
            try {
                let data = await serverRequester.send({ type: 'patch', body: input, id, headers })
                pubSub.publish("serverUpdated", { serverUpdated: data })
                return data
            } catch (e) {
                throw new Error(e)
            }
        },
        deleteServer: async (_, { id }, { workspaceRequester, projectRequester, serverRequester, headers }) => {
            try {
                let data = await serverRequester.send({ type: 'delete', id, headers })
                pubSub.publish("serverDeleted", { serverDeleted: data })
                return data
            } catch (e) {
                throw new Error(e)
            }
        },
    },
})