const fs = require("fs")
const {printSchema, parse, GraphQLSchema, print} = require("graphql")
const merge = require("lodash").merge
const { makeExecutableSchema, } = require("graphql-tools")
const path = require("path")
const {generateGraphqlSchema, generateGraphqlServer, generatePackageJSON, whitelistTypes, onDeleteRelations, reservedTypes} = require("./generators")
const ncp = require('ncp').ncp;
const config = JSON.parse(fs.readFileSync("./config.json").toString())
const pluralize = require('pluralize')
const { camelize, beautify } = require("./utils")
let type = fs.readFileSync("./schema.graphql").toString()
const directives = require('./directives')
const scalars = require('./scalars')

// let buildSchema = makeExecutableSchema({
//     typeDefs: [scalars, type ],
//     schemaDirectives: {
//         upper: UpperCaseDirective
//     },
// })
let rawSchema = scalars+directives+type
let schema = parse(rawSchema);

const graphqlDirectiory = './outputs/graphql/';
const featherDirectory = './outputs/services/';
const emailServices = "./schema/services/email"
const authServices = "./schema/services/user"
const authGraphql =  "./schema/graphql/user.js"
const baseTypeUser = `
    type User {
        _id: String
    }
`
let defaultConfigService = { 
    host: 'localhost',
    port: 3031,
    paginate: { default: 10, max: 50 },
    mongodb: 'mongodb://localhost:27017/',
    redis:{
        host:"localhost",
        port: 6379
    }
}
const writeFile = (dir, fileName, file)=> {
    //create folder if not exists
    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir)
    }
    fs.writeFile(path.join(__dirname, `${dir}${camelize(fileName)}.js`), file, (err) => {
        if(err){
            console.log(err)
        }
        console.log("Successfuly generated", camelize(fileName))
    });
}

const primitiveTypes = ["String", "Number", "Float", "Double"]
const convertToFeatherTypes = (type)=>{
    if(type == "Float"){
        return "String"
    }
    return type
}


function hookUser(schema, types, userDirectory, graphqlFile){
    let type = schema.definitions.filter((def)=> def.name.value == "User")

    //add type user just for bypass error
    if(type.length == 0){
        rawSchema += baseTypeUser
        schema = parse(rawSchema)
        return
    }

    setTimeout(() => {
        fs.readFile(graphqlFile, (err,content)=>{
           content = content.toString()
           let schemaType = require(graphqlFile)
           let typeDef = parse(schemaType.typeDef)
           typeDef.definitions.map((d)=>{
               if(d.kind == "ObjectTypeDefinition"){
                   if(d.name.value == "User"){
                       schema.definitions.map((base)=>{
                           if(base.name.value == "User"){
                                 d.fields.map((dFields, i)=>{
                                    base.fields.map((baseField)=>{
                                        if(dFields.name.value !== baseField.name.value){
                                            if(!d.fields.map((e)=> e.name.value).includes(baseField.name.value)){
                                                d.fields.push(baseField)
                                            }
                                        }else{
                                            d.fields[i] = baseField
                                        }
                                        return baseField
                                    })
                                    return dFields
                                })
                                return base
                           }
                       })
                   }
               }
               if(d.kind == "InputObjectTypeDefinition"){
                    if(d.name.value == "RegisterInput"){
                        schema.definitions.map((base)=>{
                            if(base.name.value == "User"){
                                base.fields.map((baseField)=>{
                                    d.fields.push(baseField)
                                })
                            }
                        })
                    }
               }
           })

           schemaType.typeDef = print(typeDef)
           writeFile(graphqlDirectiory, "user", 
                "const typeDef = `\n"+schemaType.typeDef+"`\n"+
                "const resolvers = {"+content.split("const resolvers = {")[1]
           )
           
           fs.readFile(userDirectory+"/src/model.js", (err,x)=>{
           let  content = "module.exports = function (app) {\n"
            content += "const mongooseClient = app.get('mongooseClient');\n"
            content += `const model = new mongooseClient.Schema({\n`
            // //fields
            typeDef.definitions.map((m)=>{
                if(m.name.value == "User"){
                    let fields = []
                    m.fields.map((e)=>{
                        fields.push({
                            name: e.name.value,
                            type: e.type.kind == "NamedType" ? e.type.name.value : e.type.type.name.value,
                            required: e.type.kind == "NonNullType" ? true : false,
                            directives: e.directives
                        })
                    })
                    //default value
                    content += "\t\temail: {type: String, unique: true, lowercase: true},\n"
                    content += "\t\tpassword: { type: String },\n"
                    content += "\t\tfirstName: { type: String },\n"
                    content += "\t\tlastName: { type: String },\n"
                    content += "\t\trole: {type: String},\n"

                    const whitelist = ['email', 'password', 'firstName', 'lastName', 'role']
                    fields.filter((f)=> !whitelist.includes(f.name)).map((f)=>{
                        // console.log(f)
                        types.map((t)=>{
                            if(t.name == f.type){
                                content += `${camelize(t.name)+"Id"}: { type: String, required: ${f.required} },`
                            }
                        })
                        let defaultValue = null
                        f.directives.map((d)=>{

                            if(d.name.value == "default"){
                                defaultValue = d.arguments[0].value.value
                            }
                        })
                        if(f.name !== "_id" && f.name !== "id" && primitiveTypes.includes(f.type)){
                            if(defaultValue){
                                content += `${f.name}: { type: ${convertToFeatherTypes(f.type)}, required: ${f.required}, default: "${defaultValue}" },`
                            }else{
                                content += `${f.name}: { type: ${convertToFeatherTypes(f.type)}, required: ${f.required} },`
                            }

                        }
                    })
                }
            })

            content += `
                },{
                    timestamps: true
                })
                    return mongooseClient.model("users", model)
                }
            `

            writeFile(featherDirectory+"user/src/", "model", beautify(content))
        })

        })
    }, 200);
    // let schemaUser = fs.readFileSync(graphqlFile)
    // console.log(schemaUser.toString())
    // console.log(type)
}

function generateAuthentiations(types){
    ncp(authServices, "./outputs/services/user", function (err) {
        if (err) {
            return console.error(err);
        }

        ncp(emailServices, "./outputs/services/email", function (err) {
            if (err) {
                return console.error(err);
            }   
        })

        let actions = ['find', 'get', 'create', 'update', 'remove', 'patch']

        const permissions =
            `const permissions = {
                admin: ['admin:*'],
                authenticated: [
                    ${types.map((t,typeIndex)=>{
                        if(typeIndex == 0){
                            return actions.map((a, actionIndex)=>{
                                // if(typeIndex ==0 && actionIndex == 0){
                                //     return `'${camelize(t.name)}:${a}'\n`
                                // }
                                return `'${camelize(t.name)}:${a}'`
                            }).join(", ")
                        }
                        return  `\n`+actions.map((a, actionIndex)=>{
                            // if(typeIndex ==0 && actionIndex == 0){
                            //     return `'${camelize(t.name)}:${a}'\n`
                            // }
                            return `'${camelize(t.name)}:${a}'`
                        }).join(", ")
                    })}
                ],
                public: [
                    ${types.map((t, typeIndex)=>{
                        if(typeIndex == 0){
                            return actions.filter((a)=> a == "find" || a == "get" ).map((a, actionIndex)=>{
                                // if(typeIndex ==0 && actionIndex == 0){
                                //     return `'${camelize(t.name)}:${a}'\n`
                                // }
                                return `'${camelize(t.name)}:${a}'`
                            }).join(", ")
                        }
                        return `\n`+actions.filter((a)=> a == "find" || a == "get" ).map((a, actionIndex)=>{
                            if(typeIndex ==0 && actionIndex == 0){
                                return `'${camelize(t.name)}:${a}'\n`
                            }
                            return `'${camelize(t.name)}:${a}'`
                        }).join(", ")
                    })}
                ],
            }
            module.exports = {
                permissions
            }
            `
        // //generate permissions
        fs.writeFileSync("./outputs/services/user/permissions.js", beautify(permissions))

        
    });
    ncp(authGraphql, "./outputs/graphql/user.js", function (err) {
        if (err) {
            return console.error(err);
        }

        hookUser(schema,types, "./outputs/services/user", "./outputs/graphql/user.js")
    })
      


}

function addNewRequester(content, type, requesterName, requesters){
    if(requesters.includes(requesterName)){
        return content
    }
    requesters.push(requesterName)
    let contentSplitResponser = content.split(`${camelize(type)}Service.on`)
    let addNewRequester = 
`const ${pluralize.singular(camelize(requesterName))}Requester = new cote.Requester({
    name: '${pluralize.singular(requesterName)} Requester',
    key: '${pluralize.singular(camelize(requesterName))}',
})\n
`
    contentSplitResponser[0] += addNewRequester
    content = contentSplitResponser.join(`${camelize(type)}Service.on`)
    return content
}
async function main(){
    if(!fs.existsSync("./outputs")){
        fs.mkdirSync("./outputs")
    }

    //copy readme.me
    ncp("./schema/README.md", "./outputs/README.md")
    let types = []
    schema.definitions.filter((def)=> !reservedTypes.includes(def.name.value)).filter((def)=> !whitelistTypes.includes(def.kind)).map((def)=>{
        fields = []

        def.fields.map((e)=>{
            fields.push({
                name: e.name.value,
                type: e.type.kind == "NamedType" ? e.type.name.value : e.type.type.name.value,
                required: e.type.kind == "NonNullType" ? true : false,
                directives: e.directives,
                kind: e.type.kind
            })
        })
        types.push({
            name: pluralize.singular(def.name.value),
            fields
        })
    })

    generateAuthentiations(types)

    let outputGraphqlServer = generateGraphqlServer(types.map((t)=> t.name))
    writeFile("./outputs/", "graphql", outputGraphqlServer)

    // graphql
    let outputGraphqlSchema = generateGraphqlSchema(schema)
    outputGraphqlSchema.map((s, index)=>{
        writeFile(graphqlDirectiory, `${types[index].name}`, s)
    })


    generatePackageJSON(types.map((t)=> t.name))

    
    //end of graphql
    types.map((e, index)=>{
        //feathers
        if(!fs.existsSync(featherDirectory)){
            fs.mkdirSync(featherDirectory)
        }
        const path = featherDirectory+camelize(e.name)+"/"

        if(!fs.existsSync(path)){
            fs.mkdirSync(path)
        }
        const schemaExampleFeather = "./schema/services/example/"
        fs.readdir(schemaExampleFeather, function(err, fileName){
            const configPath = schemaExampleFeather+"config/"
            // fs.readdir(configPath, (err, file)=>{
            //     fs.readFile(configPath+"default.json", 'utf-8', (err,content)=>{
            //         const config = JSON.parse(content)
            //         config.port = defaultConfigService.port+index
            //         config.host = defaultConfigService.host
            //         config.mongodb = defaultConfigService.mongodb+camelize(e.name)+"_service"
            if(!fs.existsSync(path+"config/")){
                fs.mkdirSync(path+"config/")
            }
            //         // fs.writeFileSync(path+"config/default.json", JSON.stringify(config, null, 4))

            //         fs.writeFileSync(path+".env", 
            //             "HOST="+defaultConfigService.host+"\n"+
            //             "PORT="+defaultConfigService.port+index+"\n"+
            //             "MONGODB="+config.mongodb+"\n"+
            //             "REDIS_HOST="+defaultConfigService.redis.host+"\n"+
            //             "REDIS_PORT="+defaultConfigService.redis.port+"\n"
            //         )
            //     })
            // })
            let port = defaultConfigService.port + index
            fs.writeFileSync(path+".env", 
                "HOST="+defaultConfigService.host+"\n"+
                "PORT="+port+"\n"+
                "MONGODB="+defaultConfigService.mongodb+camelize(e.name)+"_service\n"+
                "REDIS_HOST="+defaultConfigService.redis.host+"\n"+
                "REDIS_PORT="+defaultConfigService.redis.port+"\n"
            )
            ncp(configPath+"default.json", path+"/config/default.json")
            ncp(schemaExampleFeather+"config.js", path+"config.js")
            ncp(schemaExampleFeather+"config/custom-environment-variables.json", path+"config/custom-environment-variables.json")
            let requesters = ['user']
            fs.readFile(schemaExampleFeather+"index.js", (err, content)=>{
                content = content.toString()
                content = content.replace(/examples/g, pluralize(camelize(e.name)))
                            .replace(/example/g, camelize(e.name))
                            .replace(/Example/g, camelize(e.name))
                

                e.fields.map((f)=>{
                    //find related field
                    f.directives.map((directive)=>{
                        // console.log(directive)
                        if(directive.name.value == "role"){
                            directive.arguments.map((args)=>{
                                if(args.name.value == "onCreate"){
                                    if(args.value.value == "own"){
                                        let contentSplit = content.split("//beforeCreate")
                                        let beforeCreate = 
                                        `
                                        context.data.userId = auth.user._id
                                        //beforeCreate     
                                        `
                                        beforeCreate += contentSplit[1]
                                        // console.log(contentSplit[0])
                                        content = contentSplit[0] + beforeCreate
                                        // console.log(content)
                                        // content = addNewRequester(content, e.name, f.name, requesters)
                                    }
                                }
                                
                                if(args.name.value == "onUpdateDelete"){
                                    if(args.value.value == "own"){
                                        let contentSplit = content.split("//beforePatch")
                                        let beforeUpdate = 
                                        `
                                        if(context.id){
                                            let post = await app.service("posts").get(context.id)
                                            if(post && post.userId !== auth.user._id){
                                                throw new Error("UnAuthorized")
                                            }
                                        }
                                        `
                                        beforeUpdate += contentSplit[1]
                                        content = contentSplit[0] + beforeUpdate

                                        let contentSplitDelete = content.split("//beforeDelete")
                                        let beforeDelete = 
                                        `
                                        if(context.id){
                                            let post = await app.service("posts").get(context.id)
                                            if(post && post.userId !== auth.user._id){
                                                throw new Error("UnAuthorized")
                                            }
                                        }
                                        `
                                        beforeDelete += contentSplitDelete[1]
                                        content = contentSplitDelete[0] + beforeDelete
                                        // console.log(contentSplit[0])
                                    }
                                }
                            })
                        }
                    })

                    types.map((t)=>{
                        if(pluralize.isSingular(f.name) && f.type == t.name){
                            let contentSplit = content.split("//beforeCreate")
                            let beforeCreate = 
                            `
                            //beforeCreate
                            if(context.data && context.data.${pluralize.singular(camelize(t.name))}Id){
                                let belongsTo = await ${pluralize.singular(camelize(t.name))}Requester.send({ 
                                    type: "show", 
                                    _id: context.data.${pluralize.singular(camelize(t.name))}Id, 
                                    headers:{
                                        token: context.params.token
                                    }
                                })
                                if(!belongsTo){
                                    throw Error("${t.name} not found.")
                                }
                            }             
                            `
                            beforeCreate += contentSplit[1]
                            content = contentSplit[0] + beforeCreate
                            content = addNewRequester(content, e.name, f.name, requesters)
                        }
                    })
                    f.directives.map((d)=>{
                        //hook on delete 
                        if(d.name.value == "relation"){
                            let directiveRelationOnDelete = d.arguments[0].value.value
                            let onDelete = onDeleteRelations(directiveRelationOnDelete, pluralize.singular(camelize(f.name)), pluralize.singular(camelize(e.name)))
                            let contentSplit = content.split("//onDelete")
                            onDelete += contentSplit[1]
                            content = contentSplit[0] + onDelete
                            content = addNewRequester(content, e.name, f.name, requesters)
                        }
                    })
                })
                

                //remove unused comments
                content = content.replace(/\/\/onDelete/g, "").replace(/\/\/beforeCreate/g, "")
                // console.log("cc", content)
                fs.writeFileSync(path+"index.js", beautify(content)) 
            })

            const srcPath = schemaExampleFeather+"src/"
            //read src
            fs.readdir(srcPath, (err, file)=>{
                if(!fs.existsSync(path+"src/")){
                    fs.mkdirSync(path+"src/")
                }

                file.map((fileName)=>{
                    fs.readFile(srcPath+fileName, (err, content)=>{
                        content = content.toString().replace(/examples/g, pluralize(camelize(e.name)))
                            .replace(/example/g, camelize(e.name))
                            .replace(/Example/g, camelize(e.name))
                            
                        if(fileName == "model.js"){
                            content = "module.exports = function (app) {\n"
                            content += "const mongooseClient = app.get('mongooseClient');\n"
                            content += `const model = new mongooseClient.Schema({\n`
                            //fields
                            e.fields.map((f)=>{
                                if(f.type == "User"){
                                    content += `${f.name}Id: { type: String, required: ${f.required} },`
                                }
                                types.map((t)=>{
                                    if(t.name == f.type && f.kind !== "ListType"){
                                        // console.log("loll",f)
                                        content += `${camelize(t.name)+"Id"}: { type: String, required: ${f.required} },`
                                    }
                                })
                                let defaultValue = null
                                f.directives.map((d)=>{
                                    if(d.name.value == "default"){
                                        defaultValue = d.arguments[0].value.value
                                    }
                                })
                                if(f.name !== "_id" && f.name !== "id" && primitiveTypes.includes(f.type) && f.kind !== "ListType"){

                                    if(defaultValue){
                                        content += `${f.name}: { type: ${convertToFeatherTypes(f.type)}, required: ${f.required}, default: "${defaultValue}" },`
                                    }else{
                                        content += `${f.name}: { type: ${convertToFeatherTypes(f.type)}, required: ${f.required} },`
                                    }

                                }
                            })
                            content += `
                                },{
                                    timestamps: true
                                })
                                    return mongooseClient.model("${pluralize(camelize(e.name))}", model)
                                }
                            `
                        }
                        // console.log(content)
                        fs.writeFileSync(path+"src/"+fileName, beautify(content))
                    })
                })
            })
        })
        //end of feathers
    })
}
main()
