export const typeDef = `
    input LoginInput {
        email: String!,
        password: String
    }

    input RegisterInput {
        email: String!,
        password: String!,
        firstName: String!,
        lastName: String!
        role: String,
    }

    extend type Query {
        users: [User]
    }

    extend type Mutation {
        login(input: LoginInput): Login
        register(input: RegisterInput): User
    }
    

    type User {
        _id: ID!
        email: String
        role: String
    }

    type Login {
        accessToken: String
        user: User
    }
`;
export const resolvers = {
    Query: {
        users: async (_,{query}, { userRequester })=>{
            return await userRequester.send({ type: 'index' })
        }
    },
    Mutation :{
        login: async (_, { input }, { userRequester }) => {
            return await userRequester.send({ type: 'login', body: input })
        },
        register: async (_, { input }, { userRequester }) => {
            return await  userRequester.send({ type: 'register', body: input })
        },
    }
};