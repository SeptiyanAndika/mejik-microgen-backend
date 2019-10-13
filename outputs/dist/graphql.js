'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _taggedTemplateLiteral2 = require('babel-runtime/helpers/taggedTemplateLiteral');

var _taggedTemplateLiteral3 = _interopRequireDefault(_taggedTemplateLiteral2);

var _templateObject = (0, _taggedTemplateLiteral3.default)(['\n   type Query { default: String }\n   type Response { message: String }\n   type Mutation { default: String }\n   type Subscription { default: String }\n\tenum Role{\nADMIN\nAUTHENTICATED\n}\nenum Relation{\nCASCADE\nSET_NULL\nRESTRICT\n}\n   scalar Timestamp\n   scalar JSON\n   scalar Upload\n   scalar DateTime\n   scalar Date\n'], ['\n   type Query { default: String }\n   type Response { message: String }\n   type Mutation { default: String }\n   type Subscription { default: String }\n\tenum Role{\nADMIN\nAUTHENTICATED\n}\nenum Relation{\nCASCADE\nSET_NULL\nRESTRICT\n}\n   scalar Timestamp\n   scalar JSON\n   scalar Upload\n   scalar DateTime\n   scalar Date\n']);

var _config = require('./config');

var _lodash = require('lodash');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _apolloServerExpress = require('apollo-server-express');

var _graphqlRateLimitDirective = require('graphql-rate-limit-directive');

var _graphql = require('graphql');

var _graphqlTypeJson = require('graphql-type-json');

var _graphqlTypeJson2 = _interopRequireDefault(_graphqlTypeJson);

var _graphqlSubscriptions = require('graphql-subscriptions');

var _user = require('./graphql/user');

var _email = require('./graphql/email');

var _pushNotification = require('./graphql/pushNotification');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

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
            var date = new Date(value);
            return (0, _moment2.default)(date).format('DD-MM-YYYY');
        },
        parseLiteral: function parseLiteral(ast) {
            if (ast.kind === _graphql.Kind.INT) {
                return parseInt(ast.value, 10); // ast value is always in string format
            }
            if (ast.kind === _graphql.Kind.STRING) {
                var date = new Date(ast.value);
                return date;
            }
            return null;
        }
    }),
    DateTime: new _graphql.GraphQLScalarType({
        name: 'DateTime',
        description: 'DateTime custom scalar type',
        parseValue: function parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize: function serialize(value) {
            return new Date(value); // value sent to the client
        },
        parseLiteral: function parseLiteral(ast) {
            if (ast.kind === _graphql.Kind.INT) {
                return parseInt(ast.value, 10); // ast value is always in string format
            }
            if (ast.kind === _graphql.Kind.STRING) {
                return ast.value;
            }
            return null;
        }
    }),
    Timestamp: new _graphql.GraphQLScalarType({
        name: 'Timestamp',
        serialize: function serialize(value) {
            return new Date(value).getTime(); // value sent to the client
        },
        parseValue: function parseValue(value) {
            try {

                var valid = new Date(value).getTime() > 0;
                if (!valid) {
                    throw new _apolloServerExpress.UserInputError("Date is not valid");
                }
                return value;
            } catch (error) {
                console.log("err", error);
                throw new _apolloServerExpress.UserInputError("Date is not valid");
            }
        },
        parseLiteral: function parseLiteral(ast) {
            try {
                var valid = new Date(Number(ast.value)).getTime() > 0;
                if (!valid) {
                    throw new _apolloServerExpress.UserInputError("Date is not valid");
                }
                return ast.value;
            } catch (error) {
                console.log("err", error);
                throw new _apolloServerExpress.UserInputError("Date is not valid");
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
        bucket: _config.S3_BUCKET_NAME,
        uuid: uuid,
        ip: req ? req.ip : '',
        storageUrl: "https://" + _config.S3_BUCKET_NAME + ".s3-ap-southeast-1.amazonaws.com/",
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
    context: context,
    playground: _config.GRAPHQL_PLAYGROUND === "true"
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

var httpServer = _http2.default.createServer(app);

server.installSubscriptionHandlers(httpServer);

httpServer.listen(_config.GRAPHQL_PORT, function () {
    console.log('🚀 Server ready at http://localhost:' + _config.GRAPHQL_PORT + server.graphqlPath);
    console.log('🚀 Subscriptions ready at ws://localhost:' + _config.GRAPHQL_PORT + server.subscriptionsPath);
});