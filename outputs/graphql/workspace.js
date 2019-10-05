export const typeDef = `
    type Workspace {
       id: String 
       name: String 
       projects (query: JSON): [Project] 
       user (query: JSON): User 
    }
    type WorkspaceConnection {
       total: Int 
       limit: Int 
       skip: Int 
       data: [Workspace] 
    }

    extend type Query {
        workspaces (query: JSON): [Workspace]
        workspace (id: String!): Workspace
        workspacesConnection (query: JSON): WorkspaceConnection
    } 

    input WorkspaceInput {
       name : String!
    }

    extend type Subscription {
       workspaceAdded: Workspace
       workspaceUpdated: Workspace
       workspaceDeleted: Workspace
    }
    extend type Mutation {
       createWorkspace(input: WorkspaceInput): Workspace
       updateWorkspace(input: WorkspaceInput, id: String): Workspace
       deleteWorkspace(id: String): Workspace
    }
`
export const resolvers = ({ pubSub }) => ({
    Query: {
        workspaces: async (_, { query }, { workspaceRequester, projectRequester, serverRequester, headers }) => {
            if (query && query.id) {
                query._id = query.id
                delete query.id
            }
            try {
                return await workspaceRequester.send({ type: 'find', query, headers })
            } catch (e) {
                throw new Error(e)
            }
        },
        workspace: async (_, { id }, { workspaceRequester, projectRequester, serverRequester, headers }) => {
            try {
                return await workspaceRequester.send({ type: 'get', id, headers })
            } catch (e) {
                throw new Error(e)
            }
        },
        workspacesConnection: async (_, { query }, { workspaceRequester, projectRequester, serverRequester, headers }) => {
            if (query && query.id) {
                query._id = query.id
                delete query.id
            }
            try {
                return await workspaceRequester.send({ type: 'findConnection', query, headers })
            } catch (e) {
                throw new Error(e)
            }
        },
    },
    Workspace: {
        projects: async ({ id }, { query }, { headers, projectRequester }) => {
            try {
                return await projectRequester.send({ type: 'find', query: Object.assign({ workspaceId: id }, query), headers })
            } catch (e) {
                throw new Error(e)
            }
        },
        user: async ({ userId }, args, { headers, userRequester }) => {
            try {
                return await userRequester.send({ type: 'get', id: userId, headers })
            } catch (e) {
                throw new Error(e)
            }
        },
    },
    Subscription: {
        workspaceAdded: {
            subscribe: () => pubSub.asyncIterator('workspaceAdded')
        },
        workspaceUpdated: {
            subscribe: () => pubSub.asyncIterator('workspaceUpdated')
        },
        workspaceDeleted: {
            subscribe: () => pubSub.asyncIterator('workspaceDeleted')
        },
    },
    Mutation: {
        createWorkspace: async (_, { input = {} }, { workspaceRequester, projectRequester, serverRequester, headers }) => {
            try {
                let data = await workspaceRequester.send({ type: 'create', body: input, headers })
                pubSub.publish("workspaceAdded", { workspaceAdded: data })
                return data
            } catch (e) {
                throw new Error(e)
            }
        },
        updateWorkspace: async (_, { input = {}, id }, { workspaceRequester, projectRequester, serverRequester, headers }) => {
            try {
                let data = await workspaceRequester.send({ type: 'patch', body: input, id, headers })
                pubSub.publish("workspaceUpdated", { workspaceUpdated: data })
                return data
            } catch (e) {
                throw new Error(e)
            }
        },
        deleteWorkspace: async (_, { id }, { workspaceRequester, projectRequester, serverRequester, headers }) => {
            try {
                let data = await workspaceRequester.send({ type: 'delete', id, headers })
                pubSub.publish("workspaceDeleted", { workspaceDeleted: data })
                return data
            } catch (e) {
                throw new Error(e)
            }
        },
    },
})