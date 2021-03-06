'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.resolvers = exports.typeDef = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var typeDef = exports.typeDef = '\n    type Workspace {\n       id: String \n       name: String \n       projects (query: JSON): [Project] \n       user (query: JSON): User \n       createdBy: User\n       updatedBy: User\n       createdAt: DateTime\n       updatedAt: DateTime\n    }\n    type WorkspaceConnection {\n       total: Int \n       limit: Int \n       skip: Int \n       data: [Workspace] \n    }\n\n    extend type Query {\n        workspaces (query: JSON): [Workspace]\n        workspace (id: String!): Workspace\n        workspacesConnection (query: JSON): WorkspaceConnection\n    } \n\n    input WorkspaceCreateInput {\n       name : String!\n    }\n\n    input WorkspaceUpdateInput {\n       name : String!\n    }\n\n    extend type Subscription {\n       workspaceAdded: Workspace\n       workspaceUpdated: Workspace\n       workspaceDeleted: Workspace\n    }\n    extend type Mutation {\n       createWorkspace(input: WorkspaceCreateInput): Workspace\n       updateWorkspace(input: WorkspaceUpdateInput, id: String): Workspace\n       deleteWorkspace(id: String): Workspace\n    }\n';
var resolvers = exports.resolvers = function resolvers(_ref) {
    var pubSub = _ref.pubSub;
    return {
        Query: {
            workspaces: function () {
                var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_, _ref2, _ref3) {
                    var query = _ref2.query;
                    var workspaceRequester = _ref3.workspaceRequester,
                        projectRequester = _ref3.projectRequester,
                        serverRequester = _ref3.serverRequester,
                        headers = _ref3.headers;
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
                                    return workspaceRequester.send({ type: 'find', query: query, headers: headers });

                                case 4:
                                    return _context.abrupt('return', _context.sent);

                                case 7:
                                    _context.prev = 7;
                                    _context.t0 = _context['catch'](1);
                                    throw new Error(_context.t0);

                                case 10:
                                case 'end':
                                    return _context.stop();
                            }
                        }
                    }, _callee, undefined, [[1, 7]]);
                }));

                function workspaces(_x, _x2, _x3) {
                    return _ref4.apply(this, arguments);
                }

                return workspaces;
            }(),
            workspace: function () {
                var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_, _ref5, _ref6) {
                    var id = _ref5.id;
                    var workspaceRequester = _ref6.workspaceRequester,
                        projectRequester = _ref6.projectRequester,
                        serverRequester = _ref6.serverRequester,
                        headers = _ref6.headers;
                    return _regenerator2.default.wrap(function _callee2$(_context2) {
                        while (1) {
                            switch (_context2.prev = _context2.next) {
                                case 0:
                                    _context2.prev = 0;
                                    _context2.next = 3;
                                    return workspaceRequester.send({ type: 'get', id: id, headers: headers });

                                case 3:
                                    return _context2.abrupt('return', _context2.sent);

                                case 6:
                                    _context2.prev = 6;
                                    _context2.t0 = _context2['catch'](0);
                                    throw new Error(_context2.t0);

                                case 9:
                                case 'end':
                                    return _context2.stop();
                            }
                        }
                    }, _callee2, undefined, [[0, 6]]);
                }));

                function workspace(_x4, _x5, _x6) {
                    return _ref7.apply(this, arguments);
                }

                return workspace;
            }(),
            workspacesConnection: function () {
                var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(_, _ref8, _ref9) {
                    var query = _ref8.query;
                    var workspaceRequester = _ref9.workspaceRequester,
                        projectRequester = _ref9.projectRequester,
                        serverRequester = _ref9.serverRequester,
                        headers = _ref9.headers;
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
                                    return workspaceRequester.send({ type: 'findConnection', query: query, headers: headers });

                                case 4:
                                    return _context3.abrupt('return', _context3.sent);

                                case 7:
                                    _context3.prev = 7;
                                    _context3.t0 = _context3['catch'](1);
                                    throw new Error(_context3.t0);

                                case 10:
                                case 'end':
                                    return _context3.stop();
                            }
                        }
                    }, _callee3, undefined, [[1, 7]]);
                }));

                function workspacesConnection(_x7, _x8, _x9) {
                    return _ref10.apply(this, arguments);
                }

                return workspacesConnection;
            }()
        },
        Workspace: {
            createdBy: function () {
                var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(_ref11, args, _ref12) {
                    var _createdBy = _ref11.createdBy;
                    var headers = _ref12.headers,
                        userRequester = _ref12.userRequester;
                    return _regenerator2.default.wrap(function _callee4$(_context4) {
                        while (1) {
                            switch (_context4.prev = _context4.next) {
                                case 0:
                                    _context4.prev = 0;
                                    _context4.next = 3;
                                    return userRequester.send({ type: 'get', id: _createdBy, headers: headers });

                                case 3:
                                    return _context4.abrupt('return', _context4.sent);

                                case 6:
                                    _context4.prev = 6;
                                    _context4.t0 = _context4['catch'](0);
                                    throw new Error(_context4.t0);

                                case 9:
                                case 'end':
                                    return _context4.stop();
                            }
                        }
                    }, _callee4, undefined, [[0, 6]]);
                }));

                function createdBy(_x10, _x11, _x12) {
                    return _ref13.apply(this, arguments);
                }

                return createdBy;
            }(),
            updatedBy: function () {
                var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(_ref14, args, _ref15) {
                    var _updatedBy = _ref14.updatedBy;
                    var headers = _ref15.headers,
                        userRequester = _ref15.userRequester;
                    return _regenerator2.default.wrap(function _callee5$(_context5) {
                        while (1) {
                            switch (_context5.prev = _context5.next) {
                                case 0:
                                    _context5.prev = 0;
                                    _context5.next = 3;
                                    return userRequester.send({ type: 'get', id: _updatedBy, headers: headers });

                                case 3:
                                    return _context5.abrupt('return', _context5.sent);

                                case 6:
                                    _context5.prev = 6;
                                    _context5.t0 = _context5['catch'](0);
                                    throw new Error(_context5.t0);

                                case 9:
                                case 'end':
                                    return _context5.stop();
                            }
                        }
                    }, _callee5, undefined, [[0, 6]]);
                }));

                function updatedBy(_x13, _x14, _x15) {
                    return _ref16.apply(this, arguments);
                }

                return updatedBy;
            }(),
            projects: function () {
                var _ref20 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(_ref17, _ref18, _ref19) {
                    var id = _ref17.id;
                    var query = _ref18.query;
                    var headers = _ref19.headers,
                        projectRequester = _ref19.projectRequester;
                    return _regenerator2.default.wrap(function _callee6$(_context6) {
                        while (1) {
                            switch (_context6.prev = _context6.next) {
                                case 0:
                                    _context6.prev = 0;
                                    _context6.next = 3;
                                    return projectRequester.send({ type: 'find', query: (0, _assign2.default)({ workspaceId: id }, query), headers: headers });

                                case 3:
                                    return _context6.abrupt('return', _context6.sent);

                                case 6:
                                    _context6.prev = 6;
                                    _context6.t0 = _context6['catch'](0);
                                    throw new Error(_context6.t0);

                                case 9:
                                case 'end':
                                    return _context6.stop();
                            }
                        }
                    }, _callee6, undefined, [[0, 6]]);
                }));

                function projects(_x16, _x17, _x18) {
                    return _ref20.apply(this, arguments);
                }

                return projects;
            }(),
            user: function () {
                var _ref23 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(_ref21, args, _ref22) {
                    var userId = _ref21.userId;
                    var headers = _ref22.headers,
                        userRequester = _ref22.userRequester;
                    return _regenerator2.default.wrap(function _callee7$(_context7) {
                        while (1) {
                            switch (_context7.prev = _context7.next) {
                                case 0:
                                    _context7.prev = 0;
                                    _context7.next = 3;
                                    return userRequester.send({ type: 'get', id: userId, headers: headers });

                                case 3:
                                    return _context7.abrupt('return', _context7.sent);

                                case 6:
                                    _context7.prev = 6;
                                    _context7.t0 = _context7['catch'](0);
                                    throw new Error(_context7.t0);

                                case 9:
                                case 'end':
                                    return _context7.stop();
                            }
                        }
                    }, _callee7, undefined, [[0, 6]]);
                }));

                function user(_x19, _x20, _x21) {
                    return _ref23.apply(this, arguments);
                }

                return user;
            }()
        },
        Subscription: {
            workspaceAdded: {
                subscribe: function subscribe() {
                    return pubSub.asyncIterator('workspaceAdded');
                }
            },
            workspaceUpdated: {
                subscribe: function subscribe() {
                    return pubSub.asyncIterator('workspaceUpdated');
                }
            },
            workspaceDeleted: {
                subscribe: function subscribe() {
                    return pubSub.asyncIterator('workspaceDeleted');
                }
            }
        },
        Mutation: {
            createWorkspace: function () {
                var _ref26 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(_, _ref24, _ref25) {
                    var _ref24$input = _ref24.input,
                        input = _ref24$input === undefined ? {} : _ref24$input;
                    var workspaceRequester = _ref25.workspaceRequester,
                        projectRequester = _ref25.projectRequester,
                        serverRequester = _ref25.serverRequester,
                        headers = _ref25.headers;
                    var data;
                    return _regenerator2.default.wrap(function _callee8$(_context8) {
                        while (1) {
                            switch (_context8.prev = _context8.next) {
                                case 0:
                                    _context8.prev = 0;
                                    _context8.next = 3;
                                    return workspaceRequester.send({ type: 'create', body: input, headers: headers });

                                case 3:
                                    data = _context8.sent;

                                    pubSub.publish("workspaceAdded", { workspaceAdded: data });
                                    return _context8.abrupt('return', data);

                                case 8:
                                    _context8.prev = 8;
                                    _context8.t0 = _context8['catch'](0);
                                    throw new Error(_context8.t0);

                                case 11:
                                case 'end':
                                    return _context8.stop();
                            }
                        }
                    }, _callee8, undefined, [[0, 8]]);
                }));

                function createWorkspace(_x22, _x23, _x24) {
                    return _ref26.apply(this, arguments);
                }

                return createWorkspace;
            }(),
            updateWorkspace: function () {
                var _ref29 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(_, _ref27, _ref28) {
                    var _ref27$input = _ref27.input,
                        input = _ref27$input === undefined ? {} : _ref27$input,
                        id = _ref27.id;
                    var workspaceRequester = _ref28.workspaceRequester,
                        projectRequester = _ref28.projectRequester,
                        serverRequester = _ref28.serverRequester,
                        headers = _ref28.headers;
                    var data;
                    return _regenerator2.default.wrap(function _callee9$(_context9) {
                        while (1) {
                            switch (_context9.prev = _context9.next) {
                                case 0:
                                    _context9.prev = 0;
                                    _context9.next = 3;
                                    return workspaceRequester.send({ type: 'patch', body: input, id: id, headers: headers });

                                case 3:
                                    data = _context9.sent;

                                    pubSub.publish("workspaceUpdated", { workspaceUpdated: data });
                                    return _context9.abrupt('return', data);

                                case 8:
                                    _context9.prev = 8;
                                    _context9.t0 = _context9['catch'](0);
                                    throw new Error(_context9.t0);

                                case 11:
                                case 'end':
                                    return _context9.stop();
                            }
                        }
                    }, _callee9, undefined, [[0, 8]]);
                }));

                function updateWorkspace(_x25, _x26, _x27) {
                    return _ref29.apply(this, arguments);
                }

                return updateWorkspace;
            }(),
            deleteWorkspace: function () {
                var _ref32 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(_, _ref30, _ref31) {
                    var id = _ref30.id;
                    var workspaceRequester = _ref31.workspaceRequester,
                        projectRequester = _ref31.projectRequester,
                        serverRequester = _ref31.serverRequester,
                        headers = _ref31.headers;
                    var data;
                    return _regenerator2.default.wrap(function _callee10$(_context10) {
                        while (1) {
                            switch (_context10.prev = _context10.next) {
                                case 0:
                                    _context10.prev = 0;
                                    _context10.next = 3;
                                    return workspaceRequester.send({ type: 'delete', id: id, headers: headers });

                                case 3:
                                    data = _context10.sent;

                                    pubSub.publish("workspaceDeleted", { workspaceDeleted: data });
                                    return _context10.abrupt('return', data);

                                case 8:
                                    _context10.prev = 8;
                                    _context10.t0 = _context10['catch'](0);
                                    throw new Error(_context10.t0);

                                case 11:
                                case 'end':
                                    return _context10.stop();
                            }
                        }
                    }, _callee10, undefined, [[0, 8]]);
                }));

                function deleteWorkspace(_x28, _x29, _x30) {
                    return _ref32.apply(this, arguments);
                }

                return deleteWorkspace;
            }()
        }
    };
};