'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require("graphql"),
    parse = _require.parse,
    print = _require.print,
    GraphQLDirective = _require.GraphQLDirective;

var fs = require('fs');

///function for customize graphql
var injectConfigFromHook = function injectConfigFromHook(hook, schema) {
    var path = '../../hooks/' + hook;
    if (fs.existsSync(path)) {
        hook = require(path);
        if (hook().config) {
            (0, _keys2.default)(hook().config).map(function (method) {
                if (hook().config[method].rateLimit) {
                    var newSchema = addRateLimit(method, hook().config[method].rateLimit, schema);
                    schema = newSchema;
                }
            });
        }
    }

    return schema;
};

var addRateLimit = function addRateLimit(method, options, schema) {
    // console.log("before", parse(schema))
    var parseSchema = parse(schema);
    var newDefinitions = parseSchema.definitions.map(function (def) {
        if (def.name.value == "Mutation") {
            def.fields.map(function (f) {
                // console.log(f)
                if (f.name.value == method) {
                    f.directives.push({
                        kind: "Directive",
                        name: {
                            kind: "Name",
                            value: 'rateLimit'
                        },
                        arguments: [{
                            kind: "Argument",
                            name: {
                                kind: "Name",
                                value: "limit"
                            },
                            value: {
                                kind: "IntValue",
                                value: options.limit
                            }
                        }, {
                            kind: "Argument",
                            name: {
                                kind: "Name",
                                value: "duration"
                            },
                            value: {
                                kind: "IntValue",
                                value: options.duration
                            }
                        }]
                    });
                }
            });
        }
    });

    console.log("afterr", print(parseSchema));
    return print(parseSchema);
};

module.exports = {
    injectConfigFromHook: injectConfigFromHook
};