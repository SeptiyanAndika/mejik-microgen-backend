"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var typeDef = "\ninput LoginInput {\n  email: String!\n  password: String\n}\n\ninput LoginWithGoogleInput {\n  jwtToken: String\n}\n\ninput LoginWithFacebookInput {\n  jwtToken: String\n}\n\ninput RegisterInput {\n  email: String!\n  password: String!\n  firstName: String!\n  lastName: String\n  phoneNumbers: String\n  image: String\n  status: String\n}\n\ninput UserUpdateInput {\n  password: String\n  firstName: String\n  lastName: String\n  role: Role\n}\n\ninput ChangeProfileInput {\n  firstName: String\n  lastName: String\n  phoneNumbers: String\n  image: String\n  status: String\n}\n\ninput UserCreateInput {\n  email: String!\n  password: String!\n  firstName: String!\n  lastName: String\n  role: Role!\n}\n\ninput VerifyEmailInput {\n  token: String!\n}\n\ntype UsersConnection {\n  total: Int\n  limit: Int\n  skip: Int\n  data: [User]\n}\n\ninput ChangePasswordInput {\n  oldPassword: String!\n  newPassword: String!\n}\n\nextend type Query {\n  users(query: JSON): [User]\n  user(id: String): User\n  usersConnection(query: JSON): UsersConnection\n}\n\nextend type Mutation {\n  login(input: LoginInput): Login\n  register(input: RegisterInput): Login\n  loginWithGoogle(input: LoginWithGoogleInput): Login\n  loginWithFacebook(input: LoginWithFacebookInput): Login\n  createUser(input: UserCreateInput): Login\n  forgetPassword(input: ForgetPasswordInput): Response\n  resetPassword(input: ResetPasswordInput): Response\n  verifyEmail(input: VerifyEmailInput): Response\n  updateUser(input: UserUpdateInput, id: String!): User\n  deleteUser(id: String!): User\n  changeProfile(input: ChangeProfileInput): User\n  changePassword(input: ChangePasswordInput): Response\n  reSendVerifyEmail: Response\n}\n\ntype User {\n  id: ID!\n  firstName: String\n  lastName: String\n  email: String\n  status: String\n  role: String\n  createdBy: String\n  updatedBy: String\n  createdAt: DateTime\n  updatedAt: DateTime\n  phoneNumbers: String\n  image: String\n  servers: [Server]\n}\n\ntype ForgetPassword {\n  token: String!\n}\n\ntype Login {\n  token: String\n  user: User\n}\n\ninput ForgetPasswordInput {\n  email: String!\n}\n\ninput ResetPasswordInput {\n  newPassword: String!\n  token: String!\n}\n";
var resolvers = {
    Query: {
        users: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_, _ref, _ref2) {
                var query = _ref.query;
                var userRequester = _ref2.userRequester,
                    headers = _ref2.headers;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (query && query.id) {
                                    query._id = query.id;
                                    delete query.id;
                                }
                                _context.prev = 1;
                                _context.next = 4;
                                return userRequester.send({ type: "find", query: query, headers: headers });

                            case 4:
                                return _context.abrupt("return", _context.sent);

                            case 7:
                                _context.prev = 7;
                                _context.t0 = _context["catch"](1);
                                throw new Error(_context.t0);

                            case 10:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, undefined, [[1, 7]]);
            }));

            function users(_x, _x2, _x3) {
                return _ref3.apply(this, arguments);
            }

            return users;
        }(),
        user: function () {
            var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_, _ref4, _ref5) {
                var id = _ref4.id;
                var headers = _ref5.headers,
                    userRequester = _ref5.userRequester;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.prev = 0;
                                _context2.next = 3;
                                return userRequester.send({ type: "get", id: id, headers: headers });

                            case 3:
                                return _context2.abrupt("return", _context2.sent);

                            case 6:
                                _context2.prev = 6;
                                _context2.t0 = _context2["catch"](0);
                                throw new Error(_context2.t0);

                            case 9:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, undefined, [[0, 6]]);
            }));

            function user(_x4, _x5, _x6) {
                return _ref6.apply(this, arguments);
            }

            return user;
        }(),
        usersConnection: function () {
            var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(_, _ref7, _ref8) {
                var query = _ref7.query;
                var headers = _ref8.headers,
                    userRequester = _ref8.userRequester;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                if (query && query.id) {
                                    query._id = query.id;
                                    delete query.id;
                                }
                                _context3.prev = 1;
                                _context3.next = 4;
                                return userRequester.send({ type: "findConnection", query: query, headers: headers });

                            case 4:
                                return _context3.abrupt("return", _context3.sent);

                            case 7:
                                _context3.prev = 7;
                                _context3.t0 = _context3["catch"](1);
                                throw new Error(_context3.t0);

                            case 10:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, undefined, [[1, 7]]);
            }));

            function usersConnection(_x7, _x8, _x9) {
                return _ref9.apply(this, arguments);
            }

            return usersConnection;
        }()
    },
    User: {
        servers: function () {
            var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(_ref10, _ref11, _ref12) {
                var id = _ref10.id;
                var query = _ref11.query;
                var headers = _ref12.headers,
                    serverRequester = _ref12.serverRequester;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.prev = 0;
                                _context4.next = 3;
                                return serverRequester.send({ type: 'find', query: (0, _assign2.default)({ userId: id }, query), headers: headers });

                            case 3:
                                return _context4.abrupt("return", _context4.sent);

                            case 6:
                                _context4.prev = 6;
                                _context4.t0 = _context4["catch"](0);
                                throw new Error(_context4.t0);

                            case 9:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, undefined, [[0, 6]]);
            }));

            function servers(_x10, _x11, _x12) {
                return _ref13.apply(this, arguments);
            }

            return servers;
        }()
    },

    Mutation: {
        resetPassword: function () {
            var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(_, _ref14, _ref15) {
                var _ref14$input = _ref14.input,
                    input = _ref14$input === undefined ? {} : _ref14$input;
                var userRequester = _ref15.userRequester,
                    headers = _ref15.headers;
                var data;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.prev = 0;
                                _context5.next = 3;
                                return userRequester.send({ type: "resetPassword", body: input, headers: headers });

                            case 3:
                                data = _context5.sent;
                                return _context5.abrupt("return", data);

                            case 7:
                                _context5.prev = 7;
                                _context5.t0 = _context5["catch"](0);
                                throw new Error(_context5.t0);

                            case 10:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, undefined, [[0, 7]]);
            }));

            function resetPassword(_x13, _x14, _x15) {
                return _ref16.apply(this, arguments);
            }

            return resetPassword;
        }(),
        forgetPassword: function () {
            var _ref19 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(_, _ref17, _ref18) {
                var _ref17$input = _ref17.input,
                    input = _ref17$input === undefined ? {} : _ref17$input;
                var userRequester = _ref18.userRequester,
                    headers = _ref18.headers;
                var data;
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _context6.prev = 0;
                                _context6.next = 3;
                                return userRequester.send({ type: "forgetPassword", body: input, headers: headers });

                            case 3:
                                data = _context6.sent;
                                return _context6.abrupt("return", data);

                            case 7:
                                _context6.prev = 7;
                                _context6.t0 = _context6["catch"](0);
                                throw new Error(_context6.t0);

                            case 10:
                            case "end":
                                return _context6.stop();
                        }
                    }
                }, _callee6, undefined, [[0, 7]]);
            }));

            function forgetPassword(_x16, _x17, _x18) {
                return _ref19.apply(this, arguments);
            }

            return forgetPassword;
        }(),
        createUser: function () {
            var _ref22 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(_, _ref20, _ref21) {
                var input = _ref20.input;
                var userRequester = _ref21.userRequester,
                    headers = _ref21.headers;
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.prev = 0;
                                _context7.next = 3;
                                return userRequester.send({ type: "createUser", body: input, headers: headers });

                            case 3:
                                return _context7.abrupt("return", _context7.sent);

                            case 6:
                                _context7.prev = 6;
                                _context7.t0 = _context7["catch"](0);
                                throw new Error(_context7.t0);

                            case 9:
                            case "end":
                                return _context7.stop();
                        }
                    }
                }, _callee7, undefined, [[0, 6]]);
            }));

            function createUser(_x19, _x20, _x21) {
                return _ref22.apply(this, arguments);
            }

            return createUser;
        }(),
        updateUser: function () {
            var _ref25 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(_, _ref23, _ref24) {
                var _ref23$input = _ref23.input,
                    input = _ref23$input === undefined ? {} : _ref23$input,
                    id = _ref23.id;
                var userRequester = _ref24.userRequester,
                    headers = _ref24.headers;
                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                _context8.prev = 0;
                                _context8.next = 3;
                                return userRequester.send({ type: "updateUser", body: input, id: id, headers: headers });

                            case 3:
                                return _context8.abrupt("return", _context8.sent);

                            case 6:
                                _context8.prev = 6;
                                _context8.t0 = _context8["catch"](0);
                                throw new Error(_context8.t0);

                            case 9:
                            case "end":
                                return _context8.stop();
                        }
                    }
                }, _callee8, undefined, [[0, 6]]);
            }));

            function updateUser(_x22, _x23, _x24) {
                return _ref25.apply(this, arguments);
            }

            return updateUser;
        }(),
        deleteUser: function () {
            var _ref28 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(_, _ref26, _ref27) {
                var _ref26$input = _ref26.input,
                    input = _ref26$input === undefined ? {} : _ref26$input,
                    id = _ref26.id;
                var userRequester = _ref27.userRequester,
                    headers = _ref27.headers;
                return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                _context9.prev = 0;
                                _context9.next = 3;
                                return userRequester.send({ type: "deleteUser", body: input, id: id, headers: headers });

                            case 3:
                                return _context9.abrupt("return", _context9.sent);

                            case 6:
                                _context9.prev = 6;
                                _context9.t0 = _context9["catch"](0);
                                throw new Error(_context9.t0);

                            case 9:
                            case "end":
                                return _context9.stop();
                        }
                    }
                }, _callee9, undefined, [[0, 6]]);
            }));

            function deleteUser(_x25, _x26, _x27) {
                return _ref28.apply(this, arguments);
            }

            return deleteUser;
        }(),
        changeProfile: function () {
            var _ref31 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(_, _ref29, _ref30) {
                var _ref29$input = _ref29.input,
                    input = _ref29$input === undefined ? {} : _ref29$input;
                var userRequester = _ref30.userRequester,
                    headers = _ref30.headers;
                return _regenerator2.default.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                _context10.prev = 0;
                                _context10.next = 3;
                                return userRequester.send({ type: "changeProfile", body: input, headers: headers });

                            case 3:
                                return _context10.abrupt("return", _context10.sent);

                            case 6:
                                _context10.prev = 6;
                                _context10.t0 = _context10["catch"](0);
                                throw new Error(_context10.t0);

                            case 9:
                            case "end":
                                return _context10.stop();
                        }
                    }
                }, _callee10, undefined, [[0, 6]]);
            }));

            function changeProfile(_x28, _x29, _x30) {
                return _ref31.apply(this, arguments);
            }

            return changeProfile;
        }(),
        changePassword: function () {
            var _ref34 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(_, _ref32, _ref33) {
                var _ref32$input = _ref32.input,
                    input = _ref32$input === undefined ? {} : _ref32$input;
                var userRequester = _ref33.userRequester,
                    headers = _ref33.headers;
                return _regenerator2.default.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                _context11.prev = 0;
                                _context11.next = 3;
                                return userRequester.send({ type: "changePassword", body: input, headers: headers });

                            case 3:
                                return _context11.abrupt("return", _context11.sent);

                            case 6:
                                _context11.prev = 6;
                                _context11.t0 = _context11["catch"](0);
                                throw new Error(_context11.t0);

                            case 9:
                            case "end":
                                return _context11.stop();
                        }
                    }
                }, _callee11, undefined, [[0, 6]]);
            }));

            function changePassword(_x31, _x32, _x33) {
                return _ref34.apply(this, arguments);
            }

            return changePassword;
        }(),
        verifyEmail: function () {
            var _ref37 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(_, _ref35, _ref36) {
                var input = _ref35.input;
                var userRequester = _ref36.userRequester,
                    headers = _ref36.headers;
                return _regenerator2.default.wrap(function _callee12$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                _context12.prev = 0;
                                _context12.next = 3;
                                return userRequester.send({ type: "verifyEmail", body: input, headers: headers });

                            case 3:
                                return _context12.abrupt("return", _context12.sent);

                            case 6:
                                _context12.prev = 6;
                                _context12.t0 = _context12["catch"](0);
                                throw new Error(_context12.t0);

                            case 9:
                            case "end":
                                return _context12.stop();
                        }
                    }
                }, _callee12, undefined, [[0, 6]]);
            }));

            function verifyEmail(_x34, _x35, _x36) {
                return _ref37.apply(this, arguments);
            }

            return verifyEmail;
        }(),
        reSendVerifyEmail: function () {
            var _ref40 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(_, _ref38, _ref39) {
                var input = _ref38.input;
                var userRequester = _ref39.userRequester,
                    headers = _ref39.headers;
                return _regenerator2.default.wrap(function _callee13$(_context13) {
                    while (1) {
                        switch (_context13.prev = _context13.next) {
                            case 0:
                                _context13.prev = 0;
                                _context13.next = 3;
                                return userRequester.send({ type: "reSendVerifyEmail", body: input, headers: headers });

                            case 3:
                                return _context13.abrupt("return", _context13.sent);

                            case 6:
                                _context13.prev = 6;
                                _context13.t0 = _context13["catch"](0);
                                throw new Error(_context13.t0);

                            case 9:
                            case "end":
                                return _context13.stop();
                        }
                    }
                }, _callee13, undefined, [[0, 6]]);
            }));

            function reSendVerifyEmail(_x37, _x38, _x39) {
                return _ref40.apply(this, arguments);
            }

            return reSendVerifyEmail;
        }(),
        login: function () {
            var _ref43 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(_, _ref41, _ref42) {
                var input = _ref41.input;
                var userRequester = _ref42.userRequester;
                return _regenerator2.default.wrap(function _callee14$(_context14) {
                    while (1) {
                        switch (_context14.prev = _context14.next) {
                            case 0:
                                _context14.prev = 0;
                                _context14.next = 3;
                                return userRequester.send({ type: "login", body: input });

                            case 3:
                                return _context14.abrupt("return", _context14.sent);

                            case 6:
                                _context14.prev = 6;
                                _context14.t0 = _context14["catch"](0);
                                throw new Error(_context14.t0);

                            case 9:
                            case "end":
                                return _context14.stop();
                        }
                    }
                }, _callee14, undefined, [[0, 6]]);
            }));

            function login(_x40, _x41, _x42) {
                return _ref43.apply(this, arguments);
            }

            return login;
        }(),
        loginWithGoogle: function () {
            var _ref46 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15(_, _ref44, _ref45) {
                var input = _ref44.input;
                var userRequester = _ref45.userRequester;
                return _regenerator2.default.wrap(function _callee15$(_context15) {
                    while (1) {
                        switch (_context15.prev = _context15.next) {
                            case 0:
                                _context15.prev = 0;
                                _context15.next = 3;
                                return userRequester.send({ type: "loginWithGoogle", body: input });

                            case 3:
                                return _context15.abrupt("return", _context15.sent);

                            case 6:
                                _context15.prev = 6;
                                _context15.t0 = _context15["catch"](0);
                                throw new Error(_context15.t0);

                            case 9:
                            case "end":
                                return _context15.stop();
                        }
                    }
                }, _callee15, undefined, [[0, 6]]);
            }));

            function loginWithGoogle(_x43, _x44, _x45) {
                return _ref46.apply(this, arguments);
            }

            return loginWithGoogle;
        }(),
        loginWithFacebook: function () {
            var _ref49 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16(_, _ref47, _ref48) {
                var input = _ref47.input;
                var userRequester = _ref48.userRequester;
                return _regenerator2.default.wrap(function _callee16$(_context16) {
                    while (1) {
                        switch (_context16.prev = _context16.next) {
                            case 0:
                                _context16.prev = 0;
                                _context16.next = 3;
                                return userRequester.send({ type: "loginWithFacebook", body: input });

                            case 3:
                                return _context16.abrupt("return", _context16.sent);

                            case 6:
                                _context16.prev = 6;
                                _context16.t0 = _context16["catch"](0);
                                throw new Error(_context16.t0);

                            case 9:
                            case "end":
                                return _context16.stop();
                        }
                    }
                }, _callee16, undefined, [[0, 6]]);
            }));

            function loginWithFacebook(_x46, _x47, _x48) {
                return _ref49.apply(this, arguments);
            }

            return loginWithFacebook;
        }(),
        register: function () {
            var _ref52 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee17(_, _ref50, _ref51) {
                var input = _ref50.input;
                var userRequester = _ref51.userRequester;
                return _regenerator2.default.wrap(function _callee17$(_context17) {
                    while (1) {
                        switch (_context17.prev = _context17.next) {
                            case 0:
                                _context17.prev = 0;
                                _context17.next = 3;
                                return userRequester.send({ type: "register", body: input });

                            case 3:
                                return _context17.abrupt("return", _context17.sent);

                            case 6:
                                _context17.prev = 6;
                                _context17.t0 = _context17["catch"](0);
                                throw new Error(_context17.t0);

                            case 9:
                            case "end":
                                return _context17.stop();
                        }
                    }
                }, _callee17, undefined, [[0, 6]]);
            }));

            function register(_x49, _x50, _x51) {
                return _ref52.apply(this, arguments);
            }

            return register;
        }()
    }
};

module.exports = {
    typeDef: typeDef,
    resolvers: resolvers
};