'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.resolvers = exports.typeDef = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var typeDef = exports.typeDef = '\n    input RegisterPushNotification {\n        playerId: String!\n        segment: String\n    }\n\n    input PushNotificationInput {\n        contents: String\n    }\n\n    extend type Mutation {\n        subscribePushNotificatiton(input: RegisterPushNotification!): Response\n        unsubscribePushNotification(input: RegisterPushNotification!): Response\n\n        sendPushNotification(input: PushNotificationInput!): Response\n        sendPushNotificationById(input: PushNotificationInput!, userId: String!): Response\n        sendPushNotificationBySegment(input: PushNotificationInput, segment: String!): Response\n    }\n';
var resolvers = exports.resolvers = {
    Mutation: {
        subscribePushNotificatiton: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_, _ref, _ref2) {
                var _ref$input = _ref.input,
                    input = _ref$input === undefined ? {} : _ref$input;
                var postRequester = _ref2.postRequester,
                    userFriendRequester = _ref2.userFriendRequester,
                    commentRequester = _ref2.commentRequester,
                    pushNotificationRequester = _ref2.pushNotificationRequester,
                    headers = _ref2.headers;
                var data;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.prev = 0;
                                _context.next = 3;
                                return pushNotificationRequester.send({ type: 'create', body: input, headers: headers });

                            case 3:
                                data = _context.sent;
                                return _context.abrupt('return', data);

                            case 7:
                                _context.prev = 7;
                                _context.t0 = _context['catch'](0);
                                throw new Error(_context.t0);

                            case 10:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, undefined, [[0, 7]]);
            }));

            function subscribePushNotificatiton(_x, _x2, _x3) {
                return _ref3.apply(this, arguments);
            }

            return subscribePushNotificatiton;
        }(),
        unsubscribePushNotification: function () {
            var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_, _ref4, _ref5) {
                var _ref4$input = _ref4.input,
                    input = _ref4$input === undefined ? {} : _ref4$input;
                var postRequester = _ref5.postRequester,
                    userFriendRequester = _ref5.userFriendRequester,
                    commentRequester = _ref5.commentRequester,
                    pushNotificationRequester = _ref5.pushNotificationRequester,
                    headers = _ref5.headers;
                var data;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.prev = 0;
                                _context2.next = 3;
                                return pushNotificationRequester.send({ type: 'delete', body: input, headers: headers });

                            case 3:
                                data = _context2.sent;
                                return _context2.abrupt('return', data);

                            case 7:
                                _context2.prev = 7;
                                _context2.t0 = _context2['catch'](0);
                                throw new Error(_context2.t0);

                            case 10:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, undefined, [[0, 7]]);
            }));

            function unsubscribePushNotification(_x4, _x5, _x6) {
                return _ref6.apply(this, arguments);
            }

            return unsubscribePushNotification;
        }(),
        sendPushNotificationById: function () {
            var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(_, _ref7, _ref8) {
                var _ref7$input = _ref7.input,
                    input = _ref7$input === undefined ? {} : _ref7$input,
                    userId = _ref7.userId;
                var postRequester = _ref8.postRequester,
                    userFriendRequester = _ref8.userFriendRequester,
                    commentRequester = _ref8.commentRequester,
                    pushNotificationRequester = _ref8.pushNotificationRequester,
                    headers = _ref8.headers;
                var data;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.prev = 0;
                                _context3.next = 3;
                                return pushNotificationRequester.send({ type: 'sendById', body: input, userId: userId, headers: headers });

                            case 3:
                                data = _context3.sent;
                                return _context3.abrupt('return', data);

                            case 7:
                                _context3.prev = 7;
                                _context3.t0 = _context3['catch'](0);
                                throw new Error(_context3.t0);

                            case 10:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, undefined, [[0, 7]]);
            }));

            function sendPushNotificationById(_x7, _x8, _x9) {
                return _ref9.apply(this, arguments);
            }

            return sendPushNotificationById;
        }(),
        sendPushNotificationBySegment: function () {
            var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(_, _ref10, _ref11) {
                var _ref10$input = _ref10.input,
                    input = _ref10$input === undefined ? {} : _ref10$input,
                    segment = _ref10.segment;
                var postRequester = _ref11.postRequester,
                    userFriendRequester = _ref11.userFriendRequester,
                    commentRequester = _ref11.commentRequester,
                    pushNotificationRequester = _ref11.pushNotificationRequester,
                    headers = _ref11.headers;
                var data;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.prev = 0;
                                _context4.next = 3;
                                return pushNotificationRequester.send({ type: 'sendBySegment', body: input, segment: segment, headers: headers });

                            case 3:
                                data = _context4.sent;
                                return _context4.abrupt('return', data);

                            case 7:
                                _context4.prev = 7;
                                _context4.t0 = _context4['catch'](0);
                                throw new Error(_context4.t0);

                            case 10:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, undefined, [[0, 7]]);
            }));

            function sendPushNotificationBySegment(_x10, _x11, _x12) {
                return _ref12.apply(this, arguments);
            }

            return sendPushNotificationBySegment;
        }(),
        sendPushNotification: function () {
            var _ref15 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(_, _ref13, _ref14) {
                var _ref13$input = _ref13.input,
                    input = _ref13$input === undefined ? {} : _ref13$input;
                var postRequester = _ref14.postRequester,
                    userFriendRequester = _ref14.userFriendRequester,
                    commentRequester = _ref14.commentRequester,
                    pushNotificationRequester = _ref14.pushNotificationRequester,
                    headers = _ref14.headers;
                var data;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.prev = 0;
                                _context5.next = 3;
                                return pushNotificationRequester.send({ type: 'sendAll', body: input, headers: headers });

                            case 3:
                                data = _context5.sent;
                                return _context5.abrupt('return', data);

                            case 7:
                                _context5.prev = 7;
                                _context5.t0 = _context5['catch'](0);
                                throw new Error(_context5.t0);

                            case 10:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, undefined, [[0, 7]]);
            }));

            function sendPushNotification(_x13, _x14, _x15) {
                return _ref15.apply(this, arguments);
            }

            return sendPushNotification;
        }()
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