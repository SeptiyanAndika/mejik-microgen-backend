const app = require('./src/app');
const port = app.get('port');
const server = app.listen(port);

const cote = require('cote')({ redis: { host: 'localhost', port: "6379" } })

const exampleService = new cote.Responder({ 
    name: 'Example Service',
    key: 'example'
})

// const userRequester = new cote.Requester({ 
//     name: 'User Requester', 
//     key: 'user',
// })


exampleService.on("index", async (req,cb) => {
    try{
        let examples = await app.service("examples").find({query: req.query})
        cb(null, examples)
    }catch(error){
        cb(error, null)
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

exampleService.on("show", async (req, cb) => {
    try{
        let example = await app.service("examples").get(req._id)
        cb(null, example)
    }catch(error){
        cb(error, null)
    }
})


// const checkAuthentication = (token)=>{
//     return userRequester.send({ type: 'verifyToken', accessToken: token})
// }



// app.service('examples').hooks({
//     before: {
//         create: async (context)=>{
//             try{
//                 await checkAuthentication(context.params.accessToken)
//             }catch(err){
//                 console.log("error" ,err)
//                 throw Error(err.message)
//             }
//         }
//     }
// })

server.on('listening', () =>
    console.log('Example Rest Server on http://%s:%d', app.get('host'), port)
);
