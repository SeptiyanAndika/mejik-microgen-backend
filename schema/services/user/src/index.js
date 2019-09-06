const app = require('./app');
const port = app.get('port');
const server = app.listen(port);

const cote = require('cote')({ redis: { host: 'localhost', port: "6379" } })
const userService = new cote.Responder({ 
    name: 'User Service',
    key: 'user'
})


userService.on("index", async (req, cb)=>{
  try{
    const users = await app.service("users").find()
    cb(null, users.data)
  }catch(error){
    console.log(error)
    cb(error, null)
  }
})

userService.on("login", async (req, cb)=>{
  try{
    const user = await app.service("authentication").create({
      strategy: "local",
      ...req.body
    })
    console.log(user)
    cb(null, user)
  }catch(error){
    console.log(error)
    cb(error, null)
  }
})

userService.on("register", async (req, cb) => {
  try{
    const user = await app.service("users").create({
      ...req.body
    })
    cb(null, user)
  }catch(error){
    cb(error, null)
  }
})

userService.on("verifyToken", async (req, cb) => {
  try{
    let verify = await app.service("authentication").verifyAccessToken(req.accessToken)
    cb(null, verify)
  }catch(error){
    cb(error, null)
  }
})

server.on('listening', () =>
  console.log('Feathers application started on http://%s:%d', app.get('host'), port)
);
