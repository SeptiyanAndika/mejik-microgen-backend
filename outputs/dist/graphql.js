'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _taggedTemplateLiteral2 = require('babel-runtime/helpers/taggedTemplateLiteral');

var _taggedTemplateLiteral3 = _interopRequireDefault(_taggedTemplateLiteral2);

var _templateObject = (0, _taggedTemplateLiteral3.default)(['\n   type Query { default: String }\n   type Response { message: String }\n   type Mutation { default: String }\n   type Subscription { default: String }\n   scalar Timestamp\n   scalar JSON\n   scalar Upload\n   scalar Date\n'], ['\n   type Query { default: String }\n   type Response { message: String }\n   type Mutation { default: String }\n   type Subscription { default: String }\n   scalar Timestamp\n   scalar JSON\n   scalar Upload\n   scalar Date\n']);

var _config = require('./config');

var _lodash = require('lodash');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _apolloServerExpress = require('apollo-server-express');

var _graphqlRateLimitDirective = require('graphql-rate-limit-directive');

var _graphql = require('graphql');

var _graphqlTypeJson = require('graphql-type-json');

var _graphqlTypeJson2 = _interopRequireDefault(_graphqlTypeJson);

var _graphqlSubscriptions = require('graphql-subscriptions');

var _user = require('./graphql/user');

var _email = require('./graphql/email');

var _pushNotification = require('./graphql/pushNotification');

var _workspace = require('./graphql/workspace');

var _project = require('./graphql/project');

var _server = require('./graphql/server');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('./utils/hookGraphql'),
    injectConfigFromHook = _require.injectConfigFromHook;

var pubSub = new _graphqlSubscriptions.PubSub();
var Prometheus = require('./monitor');

var cote = require('cote')({ redis: { host: _config.REDIS_HOST, port: _config.REDIS_PORT } });
var typeDefs = (0, _apolloServerExpress.gql)(_templateObject);
var resolver = {
    JSON: _graphqlTypeJson2.default,
    Upload: _apolloServerExpress.GraphQLUpload,
    Date: new _graphql.GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue: function parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize: function serialize(value) {
            return new Date(value).toString(); // value sent to the client
        },
        parseLiteral: function parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return parseInt(ast.value, 10); // ast value is always in string format
            }
            return null;
        }
    }),
    Timestamp: new _graphql.GraphQLScalarType({
        name: 'Timestamp',
        serialize: function serialize(date) {
            console.log("serialize", date);
            return date instanceof Date ? date.getTime() : null;
        },
        parseValue: function parseValue(value) {
            try {

                var valid = new Date(value).getTime() > 0;
                if (!valid) {
                    throw new UserInputError("Date is not valid");
                }
                return value;
            } catch (error) {
                throw new UserInputError("Date is not valid");
            }
        },
        parseLiteral: function parseLiteral(ast) {
            console.log("ast", ast);
            if (ast.kind === Kind.INT) {
                return new Date(parseInt(ast.value, 10));
            } else if (ast.kind === Kind.STRING) {
                return this.parseValue(ast.value);
            } else {
                return null;
            }
        }
    })
};
var schema = (0, _apolloServerExpress.makeExecutableSchema)({
    typeDefs: [typeDefs, (0, _graphqlRateLimitDirective.createRateLimitTypeDef)(), injectConfigFromHook("user", _user.typeDef), injectConfigFromHook("email", _email.typeDef), injectConfigFromHook("pushNotification", _pushNotification.typeDef), injectConfigFromHook('workspace', _workspace.typeDef), injectConfigFromHook('project', _project.typeDef), injectConfigFromHook('server', _server.typeDef)],
    resolvers: (0, _lodash.merge)(resolver, _user.resolvers, _email.resolvers, _pushNotification.resolvers, (0, _workspace.resolvers)({ pubSub: pubSub }), (0, _project.resolvers)({ pubSub: pubSub }), (0, _server.resolvers)({ pubSub: pubSub })),
    schemaDirectives: {
        rateLimit: (0, _graphqlRateLimitDirective.createRateLimitDirective)({
            keyGenerator: keyGenerator
        })
    }
});

var userRequester = new cote.Requester({
    name: 'User Requester',
    key: 'user'
});

var storageRequester = new cote.Requester({
    name: 'Storage Requester',
    key: 'storage'
});

var emailRequester = new cote.Requester({
    name: 'Email Requester',
    key: 'email'
});

var pushNotificationRequester = new cote.Requester({
    name: 'Push Notification Requester',
    key: 'pushNotification'
});

var workspaceRequester = new cote.Requester({
    name: 'Workspace Requester',
    key: 'workspace'
});

var projectRequester = new cote.Requester({
    name: 'Project Requester',
    key: 'project'
});

var serverRequester = new cote.Requester({
    name: 'Server Requester',
    key: 'server'
});

var uuid = function uuid() {
    return Math.random().toString(36).substring(7);
};

var keyGenerator = function keyGenerator(directiveArgs, obj, args, context, info) {
    return context.ip + ':' + (0, _graphqlRateLimitDirective.defaultKeyGenerator)(obj, args, context, directiveArgs);
};
var parseBearerToken = function parseBearerToken(headers) {
    return (0, _assign2.default)(headers, {
        authorization: headers.authorization ? headers.authorization.split(" ")[1] : null
    });
};

var context = function context(_ref) {
    var req = _ref.req,
        connection = _ref.connection;

    return {
        bucket: _config.BUCKET,
        uuid: uuid,
        ip: req.ip,
        storageUrl: "https://" + _config.BUCKET + ".s3-ap-southeast-1.amazonaws.com/",
        headers: !connection && parseBearerToken(req.headers),
        userRequester: userRequester,
        storageRequester: storageRequester,
        emailRequester: emailRequester,
        pushNotificationRequester: pushNotificationRequester,
        workspaceRequester: workspaceRequester,
        projectRequester: projectRequester,
        serverRequester: serverRequester
    };
};

var server = new _apolloServerExpress.ApolloServer({
    schema: schema,
    context: context
});

var app = (0, _express2.default)();

app.use(Prometheus.requestCounters);
app.use(Prometheus.responseCounters);

/**
 * Enable metrics endpoint
 */
Prometheus.injectMetricsRoute(app);

/**
 * Enable collection of default metrics
 */
Prometheus.startCollection();
server.applyMiddleware({ app: app });

app.listen({ port: _config.GRAPHQL_PORT }, function () {
    return console.log('🚀 Server ready at http://localhost:' + _config.GRAPHQL_PORT + server.graphqlPath);
});