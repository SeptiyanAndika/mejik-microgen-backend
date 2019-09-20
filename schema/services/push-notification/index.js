const { REDIS_HOST, REDIS_PORT } = require("./config")
const app = require('./src/app');
const port = app.get('port');
const server = app.listen(port);
const checkPermissions = require('feathers-permissions');
const { NotFound } = require('@feathersjs/errors');
const { sendNotifications  }= require('./pushNotification')
const cote = require('cote')({ redis: { host: REDIS_HOST, port: REDIS_PORT } })

const pushNotificationService = new cote.Responder({
    name: 'Push Notification Service',
    key: 'pushNotification'
})

const userRequester = new cote.Requester({
    name: 'User Requester',
    key: 'user',
})


pushNotificationService.on("sendAll", async (req, cb) => {
    try {
        sendNotifications({
            contents: {"en": req.body.contents},
            included_segments: ["All"]
        })
        cb(null, {
            message: 'Success.'
        })
    } catch (error) {
        console.log(error)
        cb(error.message, null)
    }
})

pushNotificationService.on("sendById", async (req, cb) => {
    try {
        let users = await app.service("pushNotifications").find({
            query: {
                userId: req.userId,
            },
           
        })
        let playersId = []
        users.data.map((user)=> !playersId.includes(user.playerId) && playersId.push(user.playerId))
        sendNotifications({
            "include_player_ids": playersId,
            "data": {"foo": "bar"},
            "contents": {"en": "English Message"}
        })
        cb(null, {
            message: 'Success.'
        })
    } catch (error) {
        cb(error.message, null)
    }
})

pushNotificationService.on("sendBySegment", async (req, cb) => {
    try {
        let users = await app.service("pushNotifications").find({
            query: {
                segment: req.segment
            }
        })
        let playersId = users.data.map((user)=> user.playerId)
        sendNotifications({
            contents: {"en": req.body.contents},
            include_player_ids: playersId
        })
        cb(null, {
            message: "Success."
        })
    } catch (error) {
        cb(error.message, null)
    }
})


pushNotificationService.on("index", async (req, cb) => {
    try {
        let token = req.headers.authorization
        let data = await app.service("pushNotifications").find({
            query: req.query,
            token
        })

        cb(null, data.data)
    } catch (error) {
        cb(error.message, null)
    }
})

pushNotificationService.on("indexConnection", async (req, cb) => {
    try {
        let token = req.headers.authorization
        let data = await app.service("pushNotifications").find({
            query: req.query,
            token
        })

        cb(null, data)
    } catch (error) {
        cb(error.message, null)
    }
})

pushNotificationService.on("store", async (req, cb) => {
    try {
        let token = req.headers.authorization
        let auth = await checkAuthentication(token)
        let users = await app.service("pushNotifications").find({
            query: {
                playerId: req.body.playerId,
                segment:req.body.segment,
                userId: auth.sub
            }
        })
        if(users.data.length > 0){
            cb(null, {
                message: "Success."
            })
            return
        }
        let data = await app.service("pushNotifications").create({
            ...req.body,
            userId: auth.sub
        }, {
            token,
            file: req.file
        })
        cb(null, {
            message: "Success."
        })
    } catch (error) {
        console.log(error)
        cb(error.message || error, null)
    }
})

// pushNotificationService.on("joinSegment", async (req, cb) => {
//     try {
//         let token = req.headers.authorization
//         let data = await app.service("pushNotifications").create(req.body, {
//             token,
//             file: req.file
//         })
//         cb(null, data)
//     } catch (error) {
//         cb(error.message, null)
//     }
// })


// pushNotificationService.on("unJoinSegment", async (req, cb) => {
//     try {
//         let token = req.headers.authorization
//         let data = await app.service("pushNotifications").remove(req.id, {
//             ...req.params || {},
//             token,
//             file: req.file
//         })
//         data.id = data._id
//         cb(null, data)
//     } catch (error) {
//         cb(error.message, null)
//     }
// })


pushNotificationService.on("update", async (req, cb) => {
    try {
        let token = req.headers.authorization
        let data = await app.service("pushNotifications").patch(req.id, req.body, {
            ...req.params||{},
            token,
            file: req.file
        })
        cb(null, data)
    } catch (error) {
        cb(error.message, null)
    }
})

pushNotificationService.on("destroy", async (req, cb) => {
    try {
        let token = req.headers.authorization
        let auth = await checkAuthentication(token)
        console.log("auth", {
            playerId: req.body.playerId,
            userId: auth.sub,
            segment:req.body.segment
        })
        let data = await app.service("pushNotifications").remove(null, {
            query: {
                playerId: req.body.playerId,
                userId: auth.sub,
                segment:req.body.segment
            },
            token
        })
        cb(null, {
            message: 'Success.'
        })
    } catch (error) {
        cb(error.message, null)
    }
})

pushNotificationService.on("show", async (req, cb) => {
    try {
        let token = req.headers.authorizations
        let data = null
        if (req.id) {
            data = await app.service("pushNotifications").get(req.id, {
                token
            })
        }
        cb(null, data)
    } catch (error) {
        cb(null, null)
    }
})


const checkAuthentication = (token) => {
    return userRequester.send({ type: 'verifyToken', token })
}


app.service('pushNotifications').hooks({
    before: {
        find: async (context) => {
            // try {
            //     let auth = await checkAuthentication(context.params.token)

            //     context.params.user = auth.user

            //     await checkPermissions({
            //         roles: ['admin', 'pushNotification']
            //     })(context)

            //     if (!context.params.permitted) {
            //         throw Error("UnAuthorized")
            //     }
            // } catch (err) {
            //     throw new Error(err)
            // }
        },
        get: async (context) => {
            // try {
            //     let auth = await checkAuthentication(context.params.token)

            //     context.params.user = auth.user

            //     await checkPermissions({
            //         roles: ['admin', 'pushNotification']
            //     })(context)

            //     if (!context.params.permitted) {
            //         throw Error("UnAuthorized")
            //     }
            // } catch (err) {
            //     throw new Error(err)
            // }
        },
        create: async (context) => {
            // try {
            //     let auth = await checkAuthentication(context.params.token)

            //     context.params.user = auth.user

            //     await checkPermissions({
            //         roles: ['admin', 'pushNotification']
            //     })(context)

            //     if (!context.params.permitted) {
            //         throw Error("UnAuthorized")
            //     }
            //     //beforeCreate
            // } catch (err) {
            //     throw new Error(err)
            // }
        },
        update: async (context) => {
            // try {
            //     let auth = await checkAuthentication(context.params.token)

            //     context.params.user = auth.user

            //     await checkPermissions({
            //         roles: ['admin', 'pushNotification']
            //     })(context)

            //     if (!context.params.permitted) {
            //         throw Error("UnAuthorized")
            //     }
            //     //beforeUpdate
            // } catch (err) {
            //     throw new Error(err)
            // }
        },
        patch: async (context) => {
            // try {
            //     let auth = await checkAuthentication(context.params.token)

            //     context.params.user = auth.user

            //     await checkPermissions({
            //         roles: ['admin', 'pushNotification']
            //     })(context)

            //     if (!context.params.permitted) {
            //         throw Error("UnAuthorized")
            //     }
            //     //beforePatch
            // } catch (err) {
            //     throw new Error(err)
            // }
        },
        remove: async (context) => {
            // try {
            //     let auth = await checkAuthentication(context.params.token)

            //     context.params.user = auth.user

            //     await checkPermissions({
            //         roles: ['admin', 'pushNotification']
            //     })(context)

            //     if (!context.params.permitted) {
            //         throw Error("UnAuthorized")
            //     }
            //     //beforeDelete
            //     //onDelete
            // } catch (err) {
            //     throw new Error(err)
            // }
        }
    },
    after:{
        create: async (context)=>{
            try{
                //afterCreate
            }catch(err){
                throw new Error(err)
            }
        },
        patch: async (context)=>{
            try{
                //afterPatch
            }catch(err){
                throw new Error(err)
            }
        },
        remove: async (context)=>{
            try{
                //afterDelete
            }catch(err){
                throw new Error(err)
            }
        }
    }
})


server.on('listening', () =>
    console.log('Example Rest Server on http://%s:%d', app.get('host'), port)
);
