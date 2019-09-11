const typeDef = `
    input LoginInput {
        email: String!,
        password: String
    }

    input RegisterInput {
        email: String!,
        password: String!,
        firstName: String!,
        lastName: String
    }


    input CreateUserInput {
        email: String!
        password: String!
        firstName: String!
        lastName: String
        phoneNumbers: String
        role: String!
    }

    extend type Query {
        users: [User]
    }

    extend type Mutation {
        login(input: LoginInput): Login
        register(input: RegisterInput): Login
        createUser(input: CreateUserInput): Login
    }

    type User {
        _id: ID!
        firstName: String
        lastName: String
        email: String
    }

    type Login {
        token: String
        user: User
    }
`;
const resolvers = {
    Query: {
        users: async (_,{query}, { userRequester })=>{
            return await userRequester.send({ type: 'index' })
        }
    },
    Mutation :{
        createUser: async (_, { input }, { userRequester, headers}) => {
            return await userRequester.send({ type: 'createUser', body: input, headers})
        },
        login: async (_, { input }, { userRequester }) => {
            return await userRequester.send({ type: 'login', body: input })
        },
        register: async (_, { input }, { userRequester }) => {
            return await  userRequester.send({ type: 'register', body: input })
        },
    }
};

module.exports = {
    typeDef,
    resolvers
}