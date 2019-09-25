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

	type ChangePasswordInput {
		oldPassword: String!
		newPassword: String!
	}

    extend type Query {
        users (query: JSON): [User]
		user (id: String): User
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
		changePassword(input: ChangePasswordInput): Response
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
			try{
				return await userRequester.send({ type: "index", query, headers });
			}catch(e){
				throw new Error(e)
			}
		},
		user: async (_, { id }, { headers, userRequester }) => {
			try{
				return await userRequester.send({ type: "show", id, headers });
			}catch(e){
				throw new Error(e)
			}
		},
		usersConnection: async (_, { query }, { headers, userRequester }) => {
			if (query && query.id) {
				query._id = query.id
				delete query.id
			}
			try{
				return await userRequester.send({ type: "indexConnection", query, headers });
			}catch(e){
				throw new Error(e)
			}
		},
	},
	//relations
	Mutation: {
		resetPassword: async (_, { input = {} }, { userRequester, headers }) => {
			try{
				let data = await userRequester.send({ type: "resetPassword", body: input, headers });
				return data;
			}catch(e){
				throw new Error(e)
			}
		},
		forgetPassword: async (_, { input = {} }, { userRequester, headers }) => {
			try{
				let data = await userRequester.send({ type: "forgetPassword", body: input, headers });
				return data;
			}catch(e){
				throw new Error(e)
			}
		},
		createUser: async (_, { input }, { userRequester, headers }) => {
			try{
				return await userRequester.send({ type: "createUser", body: input, headers });
			}catch(e){
				throw new Error(e)
			}
		},
		updateUser: async (_, { input = {}, id }, { userRequester, headers }) => {
			try{
				return await userRequester.send({ type: "updateUser", body: input, id, headers });
			}catch(e){
				throw new Error(e)
			}
		},
		deleteUser: async (_, { input = {}, id }, { userRequester, headers }) => {
			try{
				return await userRequester.send({ type: "deleteUser", body: input, id, headers });
			}catch(e){
				throw new Error(e)
			}
		},
		changeProfile: async (_, { input = {} }, { userRequester, headers }) => {
			try{
				return await userRequester.send({ type: "changeProfile", body: input, headers });				
			}catch(e){
				throw new Error(e)
			}
		},
		changePassword: async (_, { input = {} }, { userRequester, headers }) => {
			try{
				return await userRequester.send({ type: "changePassword", body: input, headers });				
			}catch(e){
				throw new Error(e)
			}
		},
		verifyEmail: async (_, { input }, { userRequester, headers }) => {
			try{
				return await userRequester.send({ type: "verifyEmail", body: input, headers });
			}catch(e){
				throw new Error(e)
			}
		},
		login: async (_, { input }, { userRequester }) => {
			try{
				return await userRequester.send({ type: "login", body: input });
			}catch(e){
				throw new Error(e)
			}
		},
		loginWithGoogle: async (_, { input }, { userRequester }) => {
			try{
				return await userRequester.send({ type: "loginWithGoogle", body: input });
			}catch(e){
				throw new Error(e)
			}
		},
		loginWithFacebook: async (_, { input }, { userRequester }) => {
			try{
				return await userRequester.send({ type: "loginWithFacebook", body: input });
			}catch(e){
				throw new Error(e)
			}
		},
		register: async (_, { input }, { userRequester }) => {
			try{
				return await userRequester.send({ type: "register", body: input });
			}catch(e){
				throw new Error(e)
			}
		}
	}
};

module.exports = {
	typeDef,
	resolvers
};
