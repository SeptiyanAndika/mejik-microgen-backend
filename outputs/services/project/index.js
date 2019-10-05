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
    externalHook = require(appRoot + '/hooks/project')
} catch (e) {

}

function camelize(text) {
    return text.replace(/^([A-Z])|[\s-_]+(\w)/g, function(match, p1, p2, offset) {
        if (p2) return p2.toUpperCase();
        return p1.toLowerCase();
    });
}

const projectService = new cote.Responder({
    name: 'Project Service',
    key: 'project',
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
const serverRequester = new cote.Requester({
    name: 'server Requester',
    key: 'server',
})

app.set('serverRequester', serverRequester)

const workspaceRequester = new cote.Requester({
    name: 'workspace Requester',
    key: 'workspace',
})

app.set('workspaceRequester', workspaceRequester)

projectService.on("find", async (req, cb) => {
    try {
        let data = await app.service("projects").find({
            query: req.query,
            headers: req.headers,
            isSystem: req.isSystem
        })

        cb(null, data.data)
    } catch (error) {
        cb(error.message, null)
    }
})

projectService.on("findConnection", async (req, cb) => {
    try {
        let data = await app.service("projects").find({
            query: req.query,
            headers: req.headers,
            isSystem: req.isSystem
        })

        cb(null, data)
    } catch (error) {
        cb(error.message, null)
    }
})

projectService.on("findOwn", async (req, cb) => {
    try {
        let data = await app.service("projects").find({
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

projectService.on("findConnectionOwn", async (req, cb) => {
    try {
        let data = await app.service("projects").find({
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

projectService.on("create", async (req, cb) => {
    try {
        let data = await app.service("projects").create(req.body, {
            headers: req.headers,
            file: req.file,
            isSystem: req.isSystem
        })
        cb(null, data)
    } catch (error) {
        cb(error.message, null)
    }
})

projectService.on("patch", async (req, cb) => {
    try {
        let data = await app.service("projects").patch(req.id, req.body, {
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

projectService.on("delete", async (req, cb) => {
    try {
        let data = await app.service("projects").remove(req.id, {
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

projectService.on("get", async (req, cb) => {
    try {
        let data = null
        if (req.id) {
            data = await app.service("projects").get(req.id, {
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


app.service('projects').hooks({
    before: {
        find: async (context) => {
            try {
                if (!context.params.isSystem) {
                    let auth = await checkAuthentication(context.params.headers && context.params.headers.authorization || '')

                    context.params.user = auth.user
                    //beforeFindAuthorization
                    await checkPermissions({
                        roles: ['admin', 'project']
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
                        roles: ['admin', 'project']
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
                        roles: ['admin', 'project']
                    })(context)

                    if (!context.params.permitted) {
                        throw Error("UnAuthorized")
                    }



                    context.data.userId = auth.user.id


                    if (context.data && context.data.workspaceId) {
                        let belongsTo = await workspaceRequester.send({
                            type: "get",
                            id: context.data.workspaceId,
                            headers: {
                                token: context.params.headers.authorization
                            }
                        })
                        if (!belongsTo) {
                            throw Error("Workspace not found.")
                        }
                    }

                    if (context.data && context.data.serverId) {
                        let belongsTo = await serverRequester.send({
                            type: "get",
                            id: context.data.serverId,
                            headers: {
                                token: context.params.headers.authorization
                            }
                        })
                        if (!belongsTo) {
                            throw Error("Server not found.")
                        }
                    }

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
                        roles: ['admin', 'project']
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
                        roles: ['admin', 'project']
                    })(context)

                    if (!context.params.permitted) {
                        throw Error("UnAuthorized")
                    }

                    if (context.id) {
                        let project = await app.service("projects").get(context.id, { headers: context.params.headers })
                        if (project && project.userId !== auth.user.id) {
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
                        roles: ['admin', 'project']
                    })(context)

                    if (!context.params.permitted) {
                        throw Error("UnAuthorized")
                    }

                    if (context.id) {
                        let project = await app.service("projects").get(context.id, { headers: context.params.headers })
                        if (project && project.userId !== auth.user.id) {
                            throw new Error("UnAuthorized")
                        }
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
    console.log('Project Rest Server on http://%s:%d', app.get('host'), port)
);