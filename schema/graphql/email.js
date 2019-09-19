export const typeDef = `
    input SendEmailInput {
        to: String!
        from: String
        subject: String!
        title: String
        body: String!
        emailImageHeader: String
        emailLink: String
        emailVerificationCode: String
    }

    input SendEmailToUsersInput {
        from: String
        subject: String!
        title: String!
        body: String!
        emailImageHeader: String
        emailLink: String
        emailVerificationCode: String
    }

    extend type Mutation {
        sendEmail(input: SendEmailInput): Response
        sendEmailToUsers(input: SendEmailToUsersInput): Response
    }
`;
export const resolvers = {
    Mutation: {
        sendEmail: async (_, { input = {} }, { postRequester, userFriendRequester, commentRequester, emailRequester, headers }) => {
            let data = await emailRequester.send({ type: 'sendToUser', body: input, headers })
            return data
        },
        sendEmailToUsers: async (_, { input = {} }, { postRequester, userFriendRequester, commentRequester, emailRequester, headers }) => {
            let data = await emailRequester.send({ type: 'sendToUsers', body: input, headers })
            return data
        },
    }
};
