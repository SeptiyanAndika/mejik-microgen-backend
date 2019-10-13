const typeDef = `
input LoginInput {
  email: String!
  password: String
}

input LoginWithGoogleInput {
  jwtToken: String
}

input LoginWithFacebookInput {
  jwtToken: String
}

input RegisterInput {
  email: String!
  password: String!
  firstName: String!
  lastName: String
  phoneNumbers: String
  image: String
  status: String
}

input UserUpdateInput {
  password: String
  firstName: String
  lastName: String
  role: Role
}

input ChangeProfileInput {
  firstName: String
  lastName: String
  phoneNumbers: String
  image: String
  status: String
}

input UserCreateInput {
  email: String!
  password: String!
  firstName: String!
  lastName: String
  role: Role!
}

input VerifyEmailInput {
  token: String!
}

type UsersConnection {
  total: Int
  limit: Int
  skip: Int
  data: [User]
}

input ChangePasswordInput {
  oldPassword: String!
  newPassword: String!
}

extend type Query {
  users(query: JSON): [User]
  user(id: String): User
  usersConnection(query: JSON): UsersConnection
}

extend type Mutation {
  login(input: LoginInput): Login
  register(input: RegisterInput): Login
  loginWithGoogle(input: LoginWithGoogleInput): Login
  loginWithFacebook(input: LoginWithFacebookInput): Login
  createUser(input: UserCreateInput): Login
  forgetPassword(input: ForgetPasswordInput): Response
  resetPassword(input: ResetPasswordInput): Response
  verifyEmail(input: VerifyEmailInput): Response
  updateUser(input: UserUpdateInput, id: String!): User
  deleteUser(id: String!): User
  changeProfile(input: ChangeProfileInput): User
  changePassword(input: ChangePasswordInput): Response
  reSendVerifyEmail: Response
}

type User {
  id: ID!
  firstName: String
  lastName: String
  email: String
  status: String
  role: String
  createdBy: String
  updatedBy: String
  createdAt: DateTime
  updatedAt: DateTime
  phoneNumbers: String
  image: String
  servers: [Server]
}

type ForgetPassword {
  token: String!
}

type Login {
  token: String
  user: User
}

input ForgetPasswordInput {
  email: String!
}

input ResetPasswordInput {
  newPassword: String!
  token: String!
}
`
const resolvers = {
    Query: {
        users: async (_, { query }, { userRequester, headers }) => {
            if (query && query.id) {
                query._id = query.id
                delete query.id
            }
            try {
                return await userRequester.send({ type: "find", query, headers });
            } catch (e) {
                throw new Error(e)
            }
        },
        user: async (_, { id }, { headers, userRequester }) => {
            try {
                return await userRequester.send({ type: "get", id, headers });
            } catch (e) {
                throw new Error(e)
            }
        },
        usersConnection: async (_, { query }, { headers, userRequester }) => {
            if (query && query.id) {
                query._id = query.id
                delete query.id
            }
            try {
                return await userRequester.send({ type: "findConnection", query, headers });
            } catch (e) {
                throw new Error(e)
            }
        },
    },
    User: {
        servers: async ({ id }, { query }, { headers, serverRequester }) => {
            try {
                return await serverRequester.send({ type: 'find', query: Object.assign({ userId: id }, query), headers })
            } catch (e) {
                throw new Error(e)
            }
        },
    },

    Mutation: {
        resetPassword: async (_, { input = {} }, { userRequester, headers }) => {
            try {
                let data = await userRequester.send({ type: "resetPassword", body: input, headers });
                return data;
            } catch (e) {
                throw new Error(e)
            }
        },
        forgetPassword: async (_, { input = {} }, { userRequester, headers }) => {
            try {
                let data = await userRequester.send({ type: "forgetPassword", body: input, headers });
                return data;
            } catch (e) {
                throw new Error(e)
            }
        },
        createUser: async (_, { input }, { userRequester, headers }) => {
            try {
                return await userRequester.send({ type: "createUser", body: input, headers });
            } catch (e) {
                throw new Error(e)
            }
        },
        updateUser: async (_, { input = {}, id }, { userRequester, headers }) => {
            try {
                return await userRequester.send({ type: "updateUser", body: input, id, headers });
            } catch (e) {
                throw new Error(e)
            }
        },
        deleteUser: async (_, { input = {}, id }, { userRequester, headers }) => {
            try {
                return await userRequester.send({ type: "deleteUser", body: input, id, headers });
            } catch (e) {
                throw new Error(e)
            }
        },
        changeProfile: async (_, { input = {} }, { userRequester, headers }) => {
            try {
                return await userRequester.send({ type: "changeProfile", body: input, headers });
            } catch (e) {
                throw new Error(e)
            }
        },
        changePassword: async (_, { input = {} }, { userRequester, headers }) => {
            try {
                return await userRequester.send({ type: "changePassword", body: input, headers });
            } catch (e) {
                throw new Error(e)
            }
        },
        verifyEmail: async (_, { input }, { userRequester, headers }) => {
            try {
                return await userRequester.send({ type: "verifyEmail", body: input, headers });
            } catch (e) {
                throw new Error(e)
            }
        },
        reSendVerifyEmail: async (_, { input }, { userRequester, headers }) => {
            try {
                return await userRequester.send({ type: "reSendVerifyEmail", body: input, headers });
            } catch (e) {
                throw new Error(e)
            }
        },
        login: async (_, { input }, { userRequester }) => {
            try {
                return await userRequester.send({ type: "login", body: input });
            } catch (e) {
                throw new Error(e)
            }
        },
        loginWithGoogle: async (_, { input }, { userRequester }) => {
            try {
                return await userRequester.send({ type: "loginWithGoogle", body: input });
            } catch (e) {
                throw new Error(e)
            }
        },
        loginWithFacebook: async (_, { input }, { userRequester }) => {
            try {
                return await userRequester.send({ type: "loginWithFacebook", body: input });
            } catch (e) {
                throw new Error(e)
            }
        },
        register: async (_, { input }, { userRequester }) => {
            try {
                return await userRequester.send({ type: "register", body: input });
            } catch (e) {
                throw new Error(e)
            }
        }
    }
};

module.exports = {
    typeDef,
    resolvers
};