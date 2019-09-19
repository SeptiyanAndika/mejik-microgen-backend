const typeDef = `
    input LoginInput {
        email: String!,
        password: String
    }
	input LoginWithGoogleInput{
		jwtToken: String
	}
	input LoginWithFacebookInput{
		jwtToken: String
	}
	
	input RegisterInput {
		email: String!,
		password: String!,
		firstName: String!,
		lastName: String
	}

	input UpdateUserInput {
		email: String
		password: String
		firstName: String
		lastName: String
	}

	input ChangeProfileInput {
		firstName: String
		lastName: String
	}

    input CreateUserInput {
        email: String!
        password: String!
        firstName: String!
        lastName: String
        role: String!
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

    extend type Query {
        users (query: JSON): [User]
		user (query: JSON): User
		usersConnection (query: JSON): UsersConnection
    }

    extend type Mutation {
        login(input: LoginInput): Login
		register(input: RegisterInput): Login
		loginWithGoogle(input: LoginWithGoogleInput): Login
		loginWithFacebook(input: LoginWithFacebookInput): Login
        createUser(input: CreateUserInput): Login
        forgetPassword(input: ForgetPasswordInput): Response
		resetPassword(input: ResetPasswordInput): Response
		verifyEmail(input: VerifyEmailInput): Response
		updateUser(input: UpdateUserInput, id: String!): User
		deleteUser(id: String!): User
		changeProfile(input: ChangeProfileInput): User
    }

    type User {
        id: ID!
        firstName: String
        lastName: String
		email: String
		status: Int
		role: String
    }

    type ForgetPassword {
        token: String!
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
        token: String!
    }

`;
const resolvers = {
	Query: {
		users: async (_, { query }, { userRequester, headers }) => {
			if (query && query.id) {
				query._id = query.id
				delete query.id
			}
			return await userRequester.send({ type: "index", query, headers });
		},
		user: async (_, { query }, { headers, userRequester }) => {
			if (query && query.id) {
				query._id = query.id
				delete query.id
			}
			return await userRequester.send({ type: "user", query, headers });
		},
		usersConnection: async (_, { query }, { headers, userRequester }) => {
			if (query && query.id) {
				query._id = query.id
				delete query.id
			}
			return await userRequester.send({ type: "indexConnection", query, headers });
		},
	},
	Mutation: {
		resetPassword: async (_, { input = {} }, { userRequester, headers }) => {
			let data = await userRequester.send({ type: "resetPassword", body: input, headers });
			return data;
		},
		forgetPassword: async (_, { input = {} }, { userRequester, headers }) => {
			let data = await userRequester.send({ type: "forgetPassword", body: input, headers });
			return data;
		},
		createUser: async (_, { input }, { userRequester, headers }) => {
			return await userRequester.send({ type: "createUser", body: input, headers });
		},
		updateUser: async (_, { input = {}, id }, { userRequester, headers }) => {
			return await userRequester.send({ type: "updateUser", body: input, id, headers });
		},
		deleteUser: async (_, { input = {}, id }, { userRequester, headers }) => {
			return await userRequester.send({ type: "deleteUser", body: input, id, headers });
		},
		changeProfile: async (_, { input = {} }, { userRequester, headers }) => {
			return await userRequester.send({ type: "changeProfile", body: input, headers });
		},
		verifyEmail: async (_, { input }, { userRequester, headers }) => {
			return await userRequester.send({ type: "verifyEmail", body: input, headers });
		},
		login: async (_, { input }, { userRequester }) => {
			return await userRequester.send({ type: "login", body: input });
		},
		loginWithGoogle: async (_, { input }, { userRequester }) => {
			return await userRequester.send({ type: "loginWithGoogle", body: input });
		},
		loginWithFacebook: async (_, { input }, { userRequester }) => {
			return await userRequester.send({ type: "loginWithFacebook", body: input });
		},
		register: async (_, { input }, { userRequester }) => {
			return await userRequester.send({ type: "register", body: input });
		}
	}
};

module.exports = {
	typeDef,
	resolvers
};
