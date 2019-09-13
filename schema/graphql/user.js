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
        forgetPassword(input: ForgetPasswordInput): ForgetPassword
        resetPassword(input: ResetPasswordInput): Response
    }

    type User {
        _id: ID!
        firstName: String
        lastName: String
        email: String
    }

    type ForgetPassword {
        hash: String!
    }

    type Login {
        token: String
        user: User
    }

    input ForgetPasswordInput {
        email : String!
    }
        
    input ResetPasswordInput {
        newPassword: String!
        hash: String!
    }

`;
const resolvers = {
    Query: {
        users: async (_,{query}, { userRequester })=>{
            return await userRequester.send({ type: 'index' })
        }
    },
    Mutation :{
        resetPassword: async (_, { input = {} }, { userRequester, headers }) => {
            let data = await userRequester.send({ type: 'resetPassword', body: input, headers })
            return data
        },
        forgetPassword: async (_, { input = {} }, { userRequester, headers }) => {
            let data = await userRequester.send({ type: 'forgetPassword', body: input, headers })
            return data
        },
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