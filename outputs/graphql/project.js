export const typeDef = `
    type Project {
       id: String 
       server (query: JSON): Server 
       workspace (query: JSON): Workspace 
       name: String 
       path: String 
       status: String 
       lastOpened: String 
       countVisited: Int 
       user (query: JSON): User 
       createdBy: User
       updatedBy: User
       createdAt: DateTime
       updatedAt: DateTime
    }
    type ProjectConnection {
       total: Int 
       limit: Int 
       skip: Int 
       data: [Project] 
    }

    extend type Query {
        projects (query: JSON): [Project]
        project (id: String!): Project
        projectsConnection (query: JSON): ProjectConnection
    } 

    input ProjectCreateInput {
       serverId : String!
       workspaceId : String!
       name : String!
       path : String!
       status : String
       lastOpened : String
       countVisited : Int
    }

    input ProjectUpdateInput {
       serverId : String!
       workspaceId : String!
       name : String!
       path : String!
       status : String
       lastOpened : String
       countVisited : Int
    }

    extend type Subscription {
       projectAdded: Project
       projectUpdated: Project
       projectDeleted: Project
    }
    extend type Mutation {
       createProject(input: ProjectCreateInput): Project
       updateProject(input: ProjectUpdateInput, id: String): Project
       deleteProject(id: String): Project
    }
`
export const resolvers = ({ pubSub }) => ({
    Query: {
        projects: async (_, { query }, { workspaceRequester, projectRequester, serverRequester, headers }) => {
            if (query && query.id) {
                query._id = query.id
                delete query.id
            }
            try {
                return await projectRequester.send({ type: 'find', query, headers })
            } catch (e) {
                throw new Error(e)
            }
        },
        project: async (_, { id }, { workspaceRequester, projectRequester, serverRequester, headers }) => {
            try {
                return await projectRequester.send({ type: 'get', id, headers })
            } catch (e) {
                throw new Error(e)
            }
        },
        projectsConnection: async (_, { query }, { workspaceRequester, projectRequester, serverRequester, headers }) => {
            if (query && query.id) {
                query._id = query.id
                delete query.id
            }
            try {
                return await projectRequester.send({ type: 'findConnection', query, headers })
            } catch (e) {
                throw new Error(e)
            }
        },
    },
    Project: {
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
        server: async ({ serverId }, args, { headers, serverRequester }) => {
            try {
                return await serverRequester.send({ type: 'get', id: serverId, headers })
            } catch (e) {
                throw new Error(e)
            }
        },
        workspace: async ({ workspaceId }, args, { headers, workspaceRequester }) => {
            try {
                return await workspaceRequester.send({ type: 'get', id: workspaceId, headers })
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
        projectAdded: {
            subscribe: () => pubSub.asyncIterator('projectAdded')
        },
        projectUpdated: {
            subscribe: () => pubSub.asyncIterator('projectUpdated')
        },
        projectDeleted: {
            subscribe: () => pubSub.asyncIterator('projectDeleted')
        },
    },
    Mutation: {
        createProject: async (_, { input = {} }, { workspaceRequester, projectRequester, serverRequester, headers }) => {
            try {
                let data = await projectRequester.send({ type: 'create', body: input, headers })
                pubSub.publish("projectAdded", { projectAdded: data })
                return data
            } catch (e) {
                throw new Error(e)
            }
        },
        updateProject: async (_, { input = {}, id }, { workspaceRequester, projectRequester, serverRequester, headers }) => {
            try {
                let data = await projectRequester.send({ type: 'patch', body: input, id, headers })
                pubSub.publish("projectUpdated", { projectUpdated: data })
                return data
            } catch (e) {
                throw new Error(e)
            }
        },
        deleteProject: async (_, { id }, { workspaceRequester, projectRequester, serverRequester, headers }) => {
            try {
                let data = await projectRequester.send({ type: 'delete', id, headers })
                pubSub.publish("projectDeleted", { projectDeleted: data })
                return data
            } catch (e) {
                throw new Error(e)
            }
        },
    },
})