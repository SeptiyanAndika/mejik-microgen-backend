export const typeDef = `
    input RegisterPushNotification {
        playerId: String!
        segment: String
    }

    input PushNotificationInput {
        contents: String
    }

    extend type Mutation {
        subscribePushNotificatiton(input: RegisterPushNotification!): Response
        unsubscribePushNotification(input: RegisterPushNotification!): Response

        sendPushNotification(input: PushNotificationInput!): Response
        sendPushNotificationById(input: PushNotificationInput!, userId: String!): Response
        sendPushNotificationBySegment(input: PushNotificationInput, segment: String!): Response
    }
`;
export const resolvers = {
    Mutation: {
        subscribePushNotificatiton: async (_, { input = {} }, { postRequester, userFriendRequester, commentRequester, pushNotificationRequester, headers }) => {
            let data = await pushNotificationRequester.send({ type: 'store', body: input, headers })
            return data
        },
        unsubscribePushNotification: async (_, { input = {} }, { postRequester, userFriendRequester, commentRequester, pushNotificationRequester, headers }) => {
            let data = await pushNotificationRequester.send({ type: 'destroy', body: input, headers })
            return data
        },
        sendPushNotificationById: async (_, { input = {}, userId }, { postRequester, userFriendRequester, commentRequester, pushNotificationRequester, headers }) => {
            let data = await pushNotificationRequester.send({ type: 'sendById', body: input, userId, headers })
            return data
        },
        sendPushNotificationBySegment: async (_, { input = {}, segment }, { postRequester, userFriendRequester, commentRequester, pushNotificationRequester, headers }) => {
            let data = await pushNotificationRequester.send({ type: 'sendBySegment', body: input, segment, headers })
            return data
        },
        sendPushNotification: async (_, { input = {},  }, { postRequester, userFriendRequester, commentRequester, pushNotificationRequester, headers }) => {
            let data = await pushNotificationRequester.send({ type: 'sendAll', body: input, headers })
            return data
        },
        // joinSegment: async (_, { input = {} }, { postRequester, userFriendRequester, commentRequester, pushNotificationRequester, headers }) => {
        //     let data = await pushNotificationRequester.send({ type: 'joinSegment', body: input, headers })
        //     return data
        // },
        // unJoinSegment: async (_, { input = {}, _id }, { postRequester, userFriendRequester, commentRequester, pushNotificationRequester, headers }) => {
        //     let data = await pushNotificationRequester.send({ type: 'unJoinSegment', body: input, _id, headers })
        //     return data
        // },
    }
};
