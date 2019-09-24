const { REDIS_HOST, REDIS_PORT } = require("./config")
const app = require('./src/app');
const port = app.get('port');
const server = app.listen(port);
const checkPermissions = require('feathers-permissions');
const { NotFound } = require('@feathersjs/errors');
const cote = require('cote')({ redis: { host: REDIS_HOST, port: REDIS_PORT } })
const appRoot = require('app-root-path');
let externalHook = null
try {
    externalHook = require(appRoot + '/hooks/example')
} catch (e) {

}

const exampleService = new cote.Responder({
    name: 'Example Service',
    key: 'example'
})

const userRequester = new cote.Requester({
    name: 'User Requester',
    key: 'user',
})

app.set('userRequester', userRequester)

exampleService.on("index", async (req, cb) => {
    try {
        let data = await app.service("examples").find({
            query: req.query,
            headers: req.headers
        })

        cb(null, data.data)
    } catch (error) {
        cb(error.message, null)
    }
})

exampleService.on("indexConnection", async (req, cb) => {
    try {
        let data = await app.service("examples").find({
            query: req.query,
            headers: req.headers
        })

        cb(null, data)
    } catch (error) {
        cb(error.message, null)
    }
})

exampleService.on("store", async (req, cb) => {
    try {
        let data = await app.service("examples").create(req.body, {
            headers: req.headers,
            file: req.file
        })
        cb(null, data)
    } catch (error) {
        cb(error.message, null)
    }
})

exampleService.on("update", async (req, cb) => {
    try {
        let data = await app.service("examples").patch(req.id, req.body, {
            ...req.params || {},
            headers: req.headers,
            file: req.file
        })
        cb(null, data)
    } catch (error) {
        cb(error.message, null)
    }
})

exampleService.on("destroy", async (req, cb) => {
    try {
        let data = await app.service("examples").remove(req.id, {
            ...req.params || {},
            headers: req.headers,
            file: req.file
        })
        data.id = data._id
        cb(null, data)
    } catch (error) {
        cb(error.message, null)
    }
})

exampleService.on("show", async (req, cb) => {
    try {
        let data = null
        if (req.id) {
            data = await app.service("examples").get(req.id, {
                headers: req.headers
            })
        }
        cb(null, data)
    } catch (error) {
        cb(error.message, null)
    }
})


const checkAuthentication = (token) => {
    return userRequester.send({ type: 'verifyToken', token })
}


app.service('examples').hooks({
    before: {
        find: async (context) => {
            try {
                let auth = await checkAuthentication(context.params.headers.authorization)

                context.params.user = auth.user

                await checkPermissions({
                    roles: ['admin', 'example']
                })(context)

                if (!context.params.permitted) {
                    throw Error("UnAuthorized")
                }
                return externalHook && externalHook(app).before && externalHook(app).before.find && externalHook(app).before.find(context)
            } catch (err) {
                throw new Error(err)
            }
        },
        get: async (context) => {
            try {
                let auth = await checkAuthentication(context.params.headers.authorization)

                context.params.user = auth.user

                await checkPermissions({
                    roles: ['admin', 'example']
                })(context)

                if (!context.params.permitted) {
                    throw Error("UnAuthorized")
                }
                return externalHook && externalHook(app).before && externalHook(app).before.get && externalHook(app).before.get(context)
            } catch (err) {
                throw new Error(err)
            }
        },
        create: async (context) => {
            try {
                let auth = await checkAuthentication(context.params.headers.authorization)

                context.params.user = auth.user

                await checkPermissions({
                    roles: ['admin', 'example']
                })(context)

                if (!context.params.permitted) {
                    throw Error("UnAuthorized")
                }
                //beforeCreate
                return externalHook && externalHook(app).before && externalHook(app).before.create && externalHook(app).before.create(context)
            } catch (err) {
                throw new Error(err)
            }
        },
        update: async (context) => {
            try {
                let auth = await checkAuthentication(context.params.headers.authorization)

                context.params.user = auth.user

                await checkPermissions({
                    roles: ['admin', 'example']
                })(context)

                if (!context.params.permitted) {
                    throw Error("UnAuthorized")
                }
                //beforeUpdate
                return externalHook && externalHook(app).before && externalHook(app).before.update && externalHook(app).before.update(context)
            } catch (err) {
                throw new Error(err)
            }
        },
        patch: async (context) => {
            try {
                let auth = await checkAuthentication(context.params.headers.authorization)

                context.params.user = auth.user

                await checkPermissions({
                    roles: ['admin', 'example']
                })(context)

                if (!context.params.permitted) {
                    throw Error("UnAuthorized")
                }
                //beforePatch
                return externalHook && externalHook(app).before && externalHook(app).before.patch && externalHook(app).before.patch(context)
            } catch (err) {
                throw new Error(err)
            }
        },
        remove: async (context) => {
            try {
                let auth = await checkAuthentication(context.params.headers.authorization)

                context.params.user = auth.user

                await checkPermissions({
                    roles: ['admin', 'example']
                })(context)

                if (!context.params.permitted) {
                    throw Error("UnAuthorized")
                }

                //beforeDelete
                //onDelete
                return externalHook && externalHook(app).before && externalHook(app).before.remove && externalHook(app).before.remove(context)
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    after: {
        find: async (context) => {
            try {
                return externalHook && externalHook(app).after && externalHook(app).after.find && externalHook(app).after.find(context)
                //afterFind
            } catch (err) {
                throw new Error(err)
            }
        },
        create: async (context) => {
            try {
                return externalHook && externalHook(app).after && externalHook(app).after.create && externalHook(app).after.create(context)
                //afterCreate
            } catch (err) {
                throw new Error(err)
            }
        },
        patch: async (context) => {
            try {
                return externalHook && externalHook(app).after && externalHook(app).after.patch && externalHook(app).after.patch(context)
                //afterPatch
            } catch (err) {
                throw new Error(err)
            }
        },
        remove: async (context) => {
            try {
                return externalHook && externalHook(app).after && externalHook(app).after.remove && externalHook(app).after.remove(context)
                //afterDelete
            } catch (err) {
                throw new Error(err)
            }
        }
    }
})


server.on('listening', () =>
    console.log('Example Rest Server on http://%s:%d', app.get('host'), port)
);
