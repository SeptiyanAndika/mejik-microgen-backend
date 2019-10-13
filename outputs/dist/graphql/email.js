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

var typeDef = exports.typeDef = '\n    input SendEmailInput {\n        to: String!\n        from: String\n        subject: String!\n        title: String\n        body: String!\n        emailImageHeader: String\n        emailLink: String\n        emailVerificationCode: String\n        createdAt: DateTime\n        updatedAt: DateTime\n    }\n\n    input SendEmailToUsersInput {\n        from: String\n        subject: String!\n        title: String!\n        body: String!\n        emailImageHeader: String\n        emailLink: String\n        emailVerificationCode: String\n    }\n\n    extend type Mutation {\n        sendEmail(input: SendEmailInput): Response\n        sendEmailToUsers(input: SendEmailToUsersInput): Response\n    }\n';
var resolvers = exports.resolvers = {
    Mutation: {
        sendEmail: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_, _ref, _ref2) {
                var _ref$input = _ref.input,
                    input = _ref$input === undefined ? {} : _ref$input;
                var postRequester = _ref2.postRequester,
                    userFriendRequester = _ref2.userFriendRequester,
                    commentRequester = _ref2.commentRequester,
                    emailRequester = _ref2.emailRequester,
                    headers = _ref2.headers;
                var data;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.prev = 0;
                                _context.next = 3;
                                return emailRequester.send({ type: 'sendToUser', body: input, headers: headers });

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

            function sendEmail(_x, _x2, _x3) {
                return _ref3.apply(this, arguments);
            }

            return sendEmail;
        }(),
        sendEmailToUsers: function () {
            var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_, _ref4, _ref5) {
                var _ref4$input = _ref4.input,
                    input = _ref4$input === undefined ? {} : _ref4$input;
                var postRequester = _ref5.postRequester,
                    userFriendRequester = _ref5.userFriendRequester,
                    commentRequester = _ref5.commentRequester,
                    emailRequester = _ref5.emailRequester,
                    headers = _ref5.headers;
                var data;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.prev = 0;
                                _context2.next = 3;
                                return emailRequester.send({ type: 'sendToUsers', body: input, headers: headers });

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

            function sendEmailToUsers(_x4, _x5, _x6) {
                return _ref6.apply(this, arguments);
            }

            return sendEmailToUsers;
        }()
    }
};