export const typeDef = `
    input EmailInput {
        from: String!
        subject: String!
        emailImageHeader: String
        emailTitle: String!
        emailBody: String!
        emailLink: String

    }

    extend type Mutation {
        sendEmail(input: EmailInput): Response
    }
`;
export const resolvers = {
    Mutation: {
        sendEmail: async (_, { input = {} }, { postRequester, userFriendRequester, commentRequester, emailRequester, headers }) => {
            let data = await emailRequester.send({ type: 'store', body: input, headers })
            return data
        },
    }
};
