const { REDIS_HOST, REDIS_PORT } = require("./config")
const app = require('./src/app');
const port = app.get('port');
const server = app.listen(port);
const checkPermissions = require('feathers-permissions');
const { NotFound } = require('@feathersjs/errors');
const cote = require('cote')({ redis: { host: REDIS_HOST, port: REDIS_PORT } })

const exampleService = new cote.Responder({ 
    name: 'Example Service',
    key: 'example'
})

const userRequester = new cote.Requester({ 
    name: 'User Requester', 
    key: 'user',
})

exampleService.on("index", async (req,cb) => {
    try{
        let token = req.headers.authorization
        let data = await app.service("examples").find({query: req.query,
            token
        })
        
        cb(null, data)
    }catch(error){
        cb(error.message, null)
    }
})

exampleService.on("store", async (req, cb) => {
    try{
        let token = req.headers.authorization
        let data = await app.service("examples").create(req.body, {
            token
        })
        cb(null, data)
    }catch(error){
        cb(error.message, null)
    }
})

exampleService.on("update", async (req, cb) => {
    try{
        let token = req.headers.authorization
        let data = await app.service("examples").patch(req._id, req.body, {
            ...req.params||{},
            token
        })
        cb(null, data)
    }catch(error){
        cb(error.message, null)
    }
})

exampleService.on("destroy", async (req, cb) => {
    try{
        let token = req.headers.authorization
        let data = await app.service("examples").remove(req._id, {
            ...req.params || {},
            token
        })
        cb(null, data)
    }catch(error){
        cb(error.message, null)
    }
})

exampleService.on("show", async (req, cb) => {
    try{
        let token = req.headers.authorization
        let data = null
        if(req._id){
            data = await app.service("examples").get(req._id, {
                token
            })
        }
        cb(null, data)
    }catch(error){
        cb(null, null)
    }
})


const checkAuthentication = (token)=>{
    return userRequester.send({ type: 'verifyToken', token})
}


app.service('examples').hooks({
    before: {
        find: async (context)=>{
            try{
                let auth = await checkAuthentication(context.params.token)

                context.params.user = auth.user
                
                await checkPermissions({
                    roles: ['admin', 'example']
                })(context)

                if(!context.params.permitted){
                    throw Error("UnAuthorized")
                }
            }catch(err){
                throw new Error(err)
            }
        },
        get: async (context)=>{
            try{
                let auth = await checkAuthentication(context.params.token)

                context.params.user = auth.user
                
                await checkPermissions({
                    roles: ['admin', 'example']
                })(context)

                if(!context.params.permitted){
                    throw Error("UnAuthorized")
                }
            }catch(err){
                throw new Error(err)
            }
        },
        create: async (context)=>{
            try{
                let auth = await checkAuthentication(context.params.token)

                context.params.user = auth.user
                
                await checkPermissions({
                    roles: ['admin', 'example']
                })(context)

                if(!context.params.permitted){
                    throw Error("UnAuthorized")
                }
                //beforeCreate
            }catch(err){
                throw new Error(err)
            }
        },
        update: async (context)=>{
            try{
                let auth = await checkAuthentication(context.params.token)

                context.params.user = auth.user
                
                await checkPermissions({
                    roles: ['admin', 'example']
                })(context)

                if(!context.params.permitted){
                    throw Error("UnAuthorized")
                }
                //beforeUpdate
            }catch(err){
                throw new Error(err)
            }
        },
        patch: async (context)=>{
            try{
                let auth = await checkAuthentication(context.params.token)

                context.params.user = auth.user
                
                await checkPermissions({
                    roles: ['admin', 'example']
                })(context)

                if(!context.params.permitted){
                    throw Error("UnAuthorized")
                }
                //beforePatch
            }catch(err){
                throw new Error(err)
            }
        },
        remove: async (context)=>{
            try{
                let auth = await checkAuthentication(context.params.token)

                context.params.user = auth.user
                
                await checkPermissions({
                    roles: ['admin', 'example']
                })(context)

                if(!context.params.permitted){
                    throw Error("UnAuthorized")
                }
                //beforeDelete
                //onDelete
            }catch(err){
                throw new Error(err)
            }
        }
    },
})


server.on('listening', () =>
    console.log('Example Rest Server on http://%s:%d', app.get('host'), port)
);
