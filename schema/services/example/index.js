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
        let token = req.headers.token
        let examples = await app.service("examples").find({query: req.query,
            accessToken: token
        })
        cb(null, examples)
    }catch(error){
        cb(error.message, null)
    }
})

exampleService.on("store", async (req, cb) => {
    try{
        let token = req.headers.token
        let create = await app.service("examples").create(req.body, {
            accessToken: token
        })
        cb(null, create)
    }catch(error){
        cb(error.message, null)
    }
})

exampleService.on("update", async (req, cb) => {
    try{
        let token = req.headers.token
        let create = await app.service("examples").patch(req._id, req.body, {
            accessToken: token
        })
        cb(null, create)
    }catch(error){
        cb(error.message, null)
    }
})

exampleService.on("destroy", async (req, cb) => {
    try{
        let token = req.headers.token
        let create = await app.service("examples").remove(req._id, {
            accessToken: token
        })
        cb(null, create)
    }catch(error){
        cb(error.message, null)
    }
})

exampleService.on("show", async (req, cb) => {
    try{
        let token = req.headers.token
        let example = await app.service("examples").get(req._id, {
            accessToken: token
        })
        cb(null, example)
    }catch(error){
        cb(error.message, null)
    }
})


const checkAuthentication = (token)=>{
    return userRequester.send({ type: 'verifyToken', accessToken: token})
}



app.service('examples').hooks({
    before: {
        find: async (context)=>{
            try{
                let auth = await checkAuthentication(context.params.accessToken)

                context.params.user = auth.user
                
                await checkPermissions({
                    roles: ['admin', 'example']
                })(context)

                if(!context.params.permitted){
                    throw Error("UnAuthorized")
                }
            }catch(err){
                console.log("error" ,err)
                throw Error(err.message)
            }
        },
        get: async (context)=>{
            try{
                let auth = await checkAuthentication(context.params.accessToken)

                context.params.user = auth.user
                
                await checkPermissions({
                    roles: ['admin', 'example']
                })(context)

                if(!context.params.permitted){
                    throw Error("UnAuthorized")
                }
            }catch(err){
                console.log("error" ,err)
                throw Error(err.message)
            }
        },
        create: async (context)=>{
            try{
                let auth = await checkAuthentication(context.params.accessToken)

                context.params.user = auth.user
                
                await checkPermissions({
                    roles: ['admin', 'example']
                })(context)

                if(!context.params.permitted){
                    throw Error("UnAuthorized")
                }
            }catch(err){
                console.log("error" ,err)
                throw Error(err.message)
            }
        },
        update: async (context)=>{
            try{
                let auth = await checkAuthentication(context.params.accessToken)

                context.params.user = auth.user
                
                await checkPermissions({
                    roles: ['admin', 'example']
                })(context)

                if(!context.params.permitted){
                    throw Error("UnAuthorized")
                }
            }catch(err){
                console.log("error" ,err)
                throw Error(err.message)
            }
        },
        patch: async (context)=>{
            try{
                let auth = await checkAuthentication(context.params.accessToken)

                context.params.user = auth.user
                
                await checkPermissions({
                    roles: ['admin', 'example']
                })(context)

                if(!context.params.permitted){
                    throw Error("UnAuthorized")
                }
            }catch(err){
                console.log("error" ,err)
                throw Error(err.message)
            }
        },
        remove: async (context)=>{
            try{
                let auth = await checkAuthentication(context.params.accessToken)

                context.params.user = auth.user
                
                await checkPermissions({
                    roles: ['admin', 'example']
                })(context)

                if(!context.params.permitted){
                    throw Error("UnAuthorized")
                }
            }catch(err){
                console.log("error" ,err)
                throw Error(err.message)
            }
        }
    },
})


server.on('listening', () =>
    console.log('Example Rest Server on http://%s:%d', app.get('host'), port)
);
