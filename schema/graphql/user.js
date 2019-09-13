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
        users (query: JSON): [User]
        user: User
        sendEmail: User
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
		users: async (_, { query }, { userRequester }) => {
			return await userRequester.send({ type: "index", query });
		},
		user: async (_, args, { headers, userRequester }) => {
			return await userRequester.send({
				type: "user",
				headers
			});
		},
		sendEmail: async (_, args, { headers, userRequester }) => {
			return await userRequester.send({
				type: "sendEmail",
				headers
			});
		}
	},
	Mutation: {
		createUser: async (_, { input }, { userRequester, headers }) => {
			return await userRequester.send({
				type: "createUser",
				body: input,
				headers
			});
		},
		login: async (_, { input }, { userRequester }) => {
			return await userRequester.send({ type: "login", body: input });
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
