const { REDIS_HOST, REDIS_PORT, COTE } = require("./config")
const app = require('./src/app');
const port = app.get('port');
const server = app.listen(port);
const checkPermissions = require('feathers-permissions');
const { NotFound } = require('@feathersjs/errors');
const cote = require('cote')({ redis: { host: REDIS_HOST, port: REDIS_PORT } })
const appRoot = require('app-root-path');
let externalHook = null
try {
    externalHook = require(appRoot + '/hooks/workspace')
} catch (e) {

}

function camelize(text) {
    return text.replace(/^([A-Z])|[\s-_]+(\w)/g, function(match, p1, p2, offset) {
        if (p2) return p2.toUpperCase();
        return p1.toLowerCase();
    });
}

const workspaceService = new cote.Responder({
    name: 'Workspace Service',
    key: 'workspace',
    port: COTE
})

const userRequester = new cote.Requester({
    name: 'User Requester',
    key: 'user',
})

const getRequester = (name) => {
    const requesterName = `${name.charAt(0).toUpperCase() + name.slice(1)} Requester`
    if (app.get(requesterName)) {
        return app.get(requesterName)
    }
    const requester = new cote.Requester({
        name: requesterName,
        key: `${camelize(name)}`,
    })
    let newRequester = {
        send: params => requester.send({ ...params, isSystem: true })
    }
    app.set(requesterName, newRequester)
    return newRequester
}

app.getRequester = getRequester
const projectRequester = new cote.Requester({
    name: 'project Requester',
    key: 'project',
})

app.set('projectRequester', projectRequester)

workspaceService.on("find", async (req, cb) => {
    try {
        let data = await app.service("workspaces").find({
            query: req.query,
            headers: req.headers,
            isSystem: req.isSystem
        })

        cb(null, data.data)
    } catch (error) {
        cb(error.message, null)
    }
})

workspaceService.on("findConnection", async (req, cb) => {
    try {
        let data = await app.service("workspaces").find({
            query: req.query,
            headers: req.headers,
            isSystem: req.isSystem
        })

        cb(null, data)
    } catch (error) {
        cb(error.message, null)
    }
})

workspaceService.on("findOwn", async (req, cb) => {
    try {
        let data = await app.service("workspaces").find({
            query: req.query,
            headers: req.headers,
            isSystem: req.isSystem,
            type: 'findOwn'
        })

        cb(null, data.data)
    } catch (error) {
        cb(error.message, null)
    }
})

workspaceService.on("findConnectionOwn", async (req, cb) => {
    try {
        let data = await app.service("workspaces").find({
            query: req.query,
            headers: req.headers,
            isSystem: req.isSystem,
            type: 'findOwn'
        })

        cb(null, data)
    } catch (error) {
        cb(error.message, null)
    }
})

workspaceService.on("create", async (req, cb) => {
    try {
        let data = await app.service("workspaces").create(req.body, {
            headers: req.headers,
            file: req.file,
            isSystem: req.isSystem
        })
        cb(null, data)
    } catch (error) {
        cb(error.message, null)
    }
})

workspaceService.on("patch", async (req, cb) => {
    try {
        let data = await app.service("workspaces").patch(req.id, req.body, {
            ...req.params || {},
            headers: req.headers,
            file: req.file,
            isSystem: req.isSystem
        })
        cb(null, data)
    } catch (error) {
        cb(error.message, null)
    }
})

workspaceService.on("delete", async (req, cb) => {
    try {
        let data = await app.service("workspaces").remove(req.id, {
            ...req.params || {},
            headers: req.headers,
            file: req.file,
            isSystem: req.isSystem
        })
        data.id = data._id
        cb(null, data)
    } catch (error) {
        cb(error.message, null)
    }
})

workspaceService.on("get", async (req, cb) => {
    try {
        let data = null
        if (req.id) {
            data = await app.service("workspaces").get(req.id, {
                headers: req.headers,
                isSystem: req.isSystem
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


app.service('workspaces').hooks({
    before: {
        find: async (context) => {
            try {
                if (!context.params.isSystem) {
                    let auth = await checkAuthentication(context.params.headers && context.params.headers.authorization || '')

                    context.params.user = auth.user
                    //beforeFindAuthorization
                    await checkPermissions({
                        roles: ['admin', 'workspace']
                    })(context)

                    if (!context.params.permitted) {
                        throw Error("UnAuthorized")
                    }
                }
                //beforeFind
                return externalHook && externalHook(app).before && externalHook(app).before.find && externalHook(app).before.find(context)
            } catch (err) {
                throw new Error(err)
            }
        },
        get: async (context) => {
            try {
                if (!context.params.isSystem) {
                    let auth = await checkAuthentication(context.params.headers && context.params.headers.authorization || '')

                    context.params.user = auth.user
                    await checkPermissions({
                        roles: ['admin', 'workspace']
                    })(context)

                    if (!context.params.permitted) {
                        throw Error("UnAuthorized")
                    }
                }
                return externalHook && externalHook(app).before && externalHook(app).before.get && externalHook(app).before.get(context)
            } catch (err) {
                throw new Error(err)
            }
        },
        create: async (context) => {
            try {
                if (!context.params.isSystem) {
                    let auth = await checkAuthentication(context.params.headers && context.params.headers.authorization || '')

                    context.params.user = auth.user

                    await checkPermissions({
                        roles: ['admin', 'workspace']
                    })(context)

                    if (!context.params.permitted) {
                        throw Error("UnAuthorized")
                    }

                    context.data.userId = auth.user.id


                }

                return externalHook && externalHook(app).before && externalHook(app).before.create && externalHook(app).before.create(context)
            } catch (err) {
                throw new Error(err)
            }
        },
        update: async (context) => {
            try {
                if (!context.params.isSystem) {
                    let auth = await checkAuthentication(context.params.headers && context.params.headers.authorization || '')

                    context.params.user = auth.user

                    await checkPermissions({
                        roles: ['admin', 'workspace']
                    })(context)

                    if (!context.params.permitted) {
                        throw Error("UnAuthorized")
                    }
                    //beforeUpdate
                }

                return externalHook && externalHook(app).before && externalHook(app).before.update && externalHook(app).before.update(context)
            } catch (err) {
                throw new Error(err)
            }
        },
        patch: async (context) => {
            try {
                if (!context.params.isSystem) {
                    let auth = await checkAuthentication(context.params.headers && context.params.headers.authorization || '')

                    context.params.user = auth.user

                    await checkPermissions({
                        roles: ['admin', 'workspace']
                    })(context)

                    if (!context.params.permitted) {
                        throw Error("UnAuthorized")
                    }

                    if (context.id) {
                        let workspace = await app.service("workspaces").get(context.id, { headers: context.params.headers })
                        if (workspace && workspace.userId !== auth.user.id) {
                            throw new Error("UnAuthorized")
                        }
                    }

                }

                return externalHook && externalHook(app).before && externalHook(app).before.patch && externalHook(app).before.patch(context)
            } catch (err) {
                throw new Error(err)
            }
        },
        remove: async (context) => {
            try {
                if (!context.params.isSystem) {
                    let auth = await checkAuthentication(context.params.headers && context.params.headers.authorization || '')

                    context.params.user = auth.user

                    await checkPermissions({
                        roles: ['admin', 'workspace']
                    })(context)

                    if (!context.params.permitted) {
                        throw Error("UnAuthorized")
                    }

                    if (context.id) {
                        let workspace = await app.service("workspaces").get(context.id, { headers: context.params.headers })
                        if (workspace && workspace.userId !== auth.user.id) {
                            throw new Error("UnAuthorized")
                        }
                    }



                    //ON DELETE SET RESTRICT
                    let projects = await projectRequester.send({
                        type: 'find',
                        query: {
                            workspaceId: context.id
                        },
                        headers: {
                            authorization: context.params.headers.authorization
                        }
                    })
                    if (projects.length > 0) {
                        throw Error("Failed delete", null)
                    }

                }
                return externalHook && externalHook(app).before && externalHook(app).before.remove && externalHook(app).before.remove(context)
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    after: {
        find: async (context) => {
            try {

                //afterFind
                return externalHook && externalHook(app).after && externalHook(app).after.find && externalHook(app).after.find(context)
            } catch (err) {
                throw new Error(err)
            }
        },
        create: async (context) => {
            try {

                //afterCreate
                return externalHook && externalHook(app).after && externalHook(app).after.create && externalHook(app).after.create(context)
            } catch (err) {
                throw new Error(err)
            }
        },
        patch: async (context) => {
            try {

                //afterPatch
                return externalHook && externalHook(app).after && externalHook(app).after.patch && externalHook(app).after.patch(context)
            } catch (err) {
                throw new Error(err)
            }
        },
        remove: async (context) => {
            try {

                //afterDelete
                return externalHook && externalHook(app).after && externalHook(app).after.remove && externalHook(app).after.remove(context)
            } catch (err) {
                throw new Error(err)
            }
        }
    }
})


server.on('listening', () =>
    console.log('Workspace Rest Server on http://%s:%d', app.get('host'), port)
);