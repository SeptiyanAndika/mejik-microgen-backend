const app = require('./src/app');
const port = app.get('port');
const server = app.listen(port);
const checkPermissions = require('feathers-permissions');
const cote = require('cote')({ redis: { host: 'localhost', port: "6379" } })

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
        let data = await app.service("examples").get(req._id, {
            token
        })
        cb(null, data)
    }catch(error){
        cb(error.message, null)
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
                throw Error(err.message)
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
                throw Error(err.message)
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
            }catch(err){
                throw Error(err.message)
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
            }catch(err){
                throw Error(err.message)
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
            }catch(err){
                throw Error(err.message)
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
            }catch(err){
                throw Error(err.message)
            }
        }
    },
})


server.on('listening', () =>
    console.log('Example Rest Server on http://%s:%d', app.get('host'), port)
);
