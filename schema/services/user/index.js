const app = require('./src/app');
const port = app.get('port');
const server = app.listen(port);
const {permissions} = require('./src/permissions')
const cote = require('cote')({ redis: { host: 'localhost', port: "6379" } })
const userService = new cote.Responder({ 
    name: 'User Service',
    key: 'user'
})


userService.on("index", async (req, cb)=>{
  try{
    const users = await app.service("users").find()
    cb(null, users)
  }catch(error){
    cb(error, null)
  }
})


userService.on("show", async (req, cb) => {
  try{
      let token = req.headers.authorization
      let data = null
      if(req._id){
          data = await app.service("users").get(req._id, {
              token
          })
      }
      cb(null, data)
  }catch(error){
      cb(null, null)
  }
})

userService.on("login", async (req, cb)=>{
  try{
    const user = await app.service("authentication").create({
      strategy: "local",
      ...req.body
    })
    user.token = user.accessToken
    cb(null, user)
  }catch(error){
    cb(error, null)
  }
})

userService.on("register", async (req, cb) => {
  try{
    const user = await app.service("users").create({
      ...req.body,
      role:"authenticated"
    })

    const auth = await app.service("authentication").create({
      strategy: "local",
      email: req.body.email,
      password: req.body.password,
    })
    
    cb(null, {
      user,
      token: auth.accessToken
    })
  }catch(error){
    cb(error, null)
  }
})

userService.on("verifyToken", async (req, cb) => {
  try{
    // console.log("verify token", app.service("authentication"))
    if(!req.token){
      cb(null, {
        user:{
          permissions: permissions["public"]
        }
      })
      return 
    }
    let verify = await app.service("authentication").verifyAccessToken(req.token)
    let user = await app.service("users").get(verify.sub, {
      query: {
        $select: ['_id', 'email', 'firstName', 'lastName', 'role']
      }
    })
    user.permissions = permissions[user.role]
    if(!user.permissions){
      cb(null, null)
      return
    }
    verify.user = user
    cb(null, verify)
  }catch(error){
    cb(error, null)
  }
})

server.on('listening', () =>
  console.log('User application started on http://%s:%d', app.get('host'), port)
);
