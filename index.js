global.__basedir = __dirname;
const fs = require("fs")
const { parse, print } = require("graphql")
const path = require("path")
const { generateGraphqlSchema, generateGraphqlServer, generatePackageJSON, whitelistTypes, onDeleteRelations, reservedTypes, fieldType } = require("./generators")
const ncp = require('ncp').ncp;
const pluralize = require('pluralize')
const directives = require('./directives')
const scalars = require('./scalars')
const { createBucket } = require('./schema/services/storage/storage')
const { camelize, beautify } = require('./utils')
let type = fs.readFileSync('./schema.graphql').toString()
const { APP_NAME } = require('./config')
// let buildSchema = makeExecutableSchema({
//     typeDefs: [scalars, type ],
//     schemaDirectives: {
//         upper: UpperCaseDirective
//     },
// })
let rawSchema = scalars + directives + type
let schema = parse(rawSchema);

const graphqlDirectiory = './outputs/graphql/';
const featherDirectory = './outputs/services/';
const utilsDirectory = './outputs/utils/';
const emailServices = "./schema/services/email"
const authServices = "./schema/services/user"
const storageServices = "./schema/services/storage"
const authGraphql = "./schema/graphql/user.js"
const emailGraphql = "./schema/graphql/email.js"
const pushNotificationServices = './schema/services/push-notification'
const pushNotificationGraphql = './schema/graphql/pushNotification.js'
const hooksDirectory = './hooks/'
const baseTypeUser = `
    type User {
        id: String
    }
`
let defaultConfigService = {
    host: 'localhost',
    port: 3031,
    paginate: { default: 10, max: 50 },
    mongodb: 'mongodb://localhost:27017/',
    redis: {
        host: "localhost",
        port: 6379
    }
}
const writeFile = (dir, fileName, file) => {
    //create folder if not exists
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }
    fs.writeFile(path.join(__dirname, `${dir}${camelize(fileName)}.js`), beautify(file), (err) => {
        if (err) {
            console.log(err)
        }
        console.log("Successfuly generated", camelize(fileName))
    });
}

const primitiveTypes = ["String", "Number", "Float", "Double", "Int", "Boolean"]
const convertToFeatherTypes = (type) => {
    if (type == "Float") {
        return "String"
    }
    if (type == "Int") {
        return "Number"
    }
    return type
}


function hookUser(schema, types, userDirectory, graphqlFile) {
    let type = schema.definitions.filter((def) => def.name.value == "User")

    //add type user just for bypass error
    if (type.length == 0) {
        rawSchema += baseTypeUser
        schema = parse(rawSchema)
        return
    }

    let relationTypes = []
    let localTypes =  types.map((t)=> camelize(t.name)) 
    setTimeout(() => {
        fs.readFile(graphqlFile, (err, content) => {
            content = content.toString()
            let schemaType = require(graphqlFile)
            let typeDef = parse(schemaType.typeDef)

            // for (let i = 0; i < typeDef.definitions.length; i++) {
            //     if (reservedTypes.includes(typeDef.definitions[i].name.value)) {
            //         continue
            //     }
            //     if (whitelistTypes.includes(typeDef.definitions[i].kind)) {
            //         continue
            //     }
            //     let typeName = pluralize.singular(typeDef.definitions[i].name.value)
            //     types.push(camelize(typeName))
            // }

            typeDef.definitions.map((d) => {
               
                if (d.kind == "ObjectTypeDefinition") {
                    if (d.name.value == "User") {

                        schema.definitions.map((base) => {
                            if (base.name.value == "User") {
                          
                                d.fields.map((dFields, i) => {
                                    base.fields.map((baseField) => {
                                        if (dFields.name.value !== baseField.name.value) {
                                            if (!d.fields.map((e) => e.name.value).includes(baseField.name.value)) {
                                                if(baseField.type.name){
                                                    if(localTypes.includes(camelize(baseField.type.name.value))){
                                                        relationTypes.push(baseField)
                                                    }
                                                }
                                                if(baseField.type.type){

                                                    if(localTypes.includes(camelize(baseField.type.type.name.value))){
                                                        relationTypes.push(baseField)
                                                    }
                                                }
                                                d.fields.push(baseField)
                                                
                                            }
                                        } else {
                                            d.fields[i] = baseField
                                        }
    
                                        return baseField
                                    })
                                    return dFields
                                })
                                return base
                            }
                            
                        })

                        // schema.definitions.map((base) => {
                        //     if (base.name.value == "User") {
                        //         console.log(base.fields)
                        //     }
                        // })
                    }
                }
                
                if (d.kind == "InputObjectTypeDefinition") {
                    if (d.name.value == "RegisterInput" || d.name.value == "CreateUserInput") {
                            schema.definitions.map((base) => {
                                if (base.name.value == "User") { 
                        
                                    base.fields.map((baseField) => {
                                        baseField = JSON.parse(JSON.stringify(baseField))
                
                                        if(baseField.type.name){
                                            if(localTypes.includes(camelize(baseField.type.name.value))){
                                                if(baseField.type.kind == "NamedType"){
                                                    baseField.name.value = baseField.name.value+"Id"
                                                    baseField.type.name.value = "String"
                                                    d.fields.push(baseField)
                                                }
                                                
                                            }else{
                                                d.fields.push(baseField)
                                            }
                                        }
                                        
                                    })
                                }
                            })
                    }
                    if (d.name.value == "UpdateUserInput" || d.name.value == "ChangeProfileInput") {
                        schema.definitions.map((base) => {
                            if (base.name.value == "User") { 
                                base.fields.map((baseField) => {
                                    if(baseField.type.name){
        
                                        if(localTypes.includes(camelize(baseField.type.name.value))){

                                        }else{
                                            d.fields.push(baseField)
                                        }
                                    }

                                })
                            }
                        })
                    }
                }
            })

            // typeDef.definitions.map((d) => {
               
            //     if (d.kind == "ObjectTypeDefinition") {
            //         if (d.name.value == "User") {
            //             console.log("d", d.fields)

            //             // schema.definitions.map((base) => {
            //             //     if (base.name.value == "User") {
            //             //         console.log(base.fields)
            //             //     }
            //             // })
            //         }
            //     }
        
            // })
            schemaType.typeDef = print(typeDef)
            let resolverRelations = content.split("const resolvers = {")[1].split("//relations")[0]
            if(relationTypes.length > 0){
                resolverRelations += `    User: {\n`

                relationTypes.map((e) => {
                    if (e.type.kind == "ListType") {
                        resolverRelations += `${e.name.value}: async ({ id }, { query }, { headers, ${camelize(pluralize.singular(e.type.type.name.value))}Requester })=>{\n`
                        resolverRelations += `        try{ \n`
                        resolverRelations += `          return await ${camelize(pluralize.singular(e.type.type.name.value))}Requester.send({ type: 'find', query: Object.assign({ userId: id }, query), headers })\n`
                        resolverRelations += `        }catch(e){ \n`
                        resolverRelations += `            throw new Error(e)`
                        resolverRelations += `        }\n`
                        resolverRelations += `  },\n`
                    } else {
                        resolverRelations += `${e.name.value}: async ({ ${e.name.value}Id }, args, { headers, ${camelize(e.type.name.value)}Requester })=>{\n`
                        resolverRelations += `        try{ \n`
                        resolverRelations += `            return await ${e.name.value}Requester.send({ type: 'get', id: ${e.name.value}Id, headers })\n`
                        resolverRelations += `        }catch(e){ \n`
                        resolverRelations += `            throw new Error(e)`
                        resolverRelations += `        }\n`
                    
                        resolverRelations += `},\n`
                    }

                })
                resolverRelations += `    },\n`
            }
            resolverRelations += content.split("const resolvers = {")[1].split("//relations")[1]
            writeFile(graphqlDirectiory, "user",
                "const typeDef = `\n" + schemaType.typeDef + "`\n" +
                "const resolvers = {" + resolverRelations
            )

            fs.readFile(userDirectory + "/src/models/user.js", (err, x) => {
                let content = "module.exports = function (app) {\n"
                content += "const mongooseVirtuals = require('mongoose-lean-virtuals');\n"
                content += "const mongooseClient = app.get('mongooseClient');\n"
                content += `const model = new mongooseClient.Schema({\n`
                // //fields
                typeDef.definitions.map((m) => {
                    if (m.name.value == "User") {
                        let fields = []
                        m.fields.map((e) => {
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
                        fields.filter((f) => !whitelist.includes(f.name)).map((f) => {
                            // console.log(f)
                            types.map((t) => {
                                if (t.name == f.type) {
                                    content += `${camelize(f.name) + "Id"}: { type: String, required: ${f.required} },`
                                }
                            })
                            let defaultValue = null
                            f.directives.map((d) => {
                                if (d.name.value == "default") {
                                    defaultValue = d.arguments[0].value.value
                                }
                            })
                            if (f.name !== "_id" && f.name !== "id" && primitiveTypes.includes(f.type)) {
                                if (defaultValue && defaultValue !== false) {
                                    content += `${f.name}: { type: ${convertToFeatherTypes(f.type)}, required: ${f.required}, default: "${defaultValue}" },`
                                } else if (defaultValue === false) {
                                    content += `${f.name}: { type: ${convertToFeatherTypes(f.type)}, required: ${f.required}, default: ${defaultValue} },`
                                } else {
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
                    model.virtual('id').get(function () {
                        return this._id
                    })
                    model.set('toObject', { virtuals: true })
                    model.set('toJSON', { virtuals: true })
                    model.plugin(mongooseVirtuals)
                    return mongooseClient.model("users", model)
                }
            `

                writeFile(featherDirectory + "user/src/models/", "user", beautify(content))
            })

        })
    }, 1000);
    // let schemaUser = fs.readFileSync(graphqlFile)
    // console.log(schemaUser.toString())
    // console.log(type)
}

function generateAuthentiations(types) {
    if (!fs.existsSync(hooksDirectory)) {
        fs.mkdirSync(hooksDirectory)
    }
    if (!fs.existsSync(utilsDirectory)) {
        fs.mkdirSync(utilsDirectory)
        ncp('./schema/utils', utilsDirectory)
    }
    if (!fs.existsSync(hooksDirectory + 'user.js')) {
        ncp('./schema/hooks/user.js', hooksDirectory + 'user.js', (err) => {
        })
    }
    ncp(authServices, "./outputs/services/user", function (err) {
        if (err) {
            return console.error(err);
        }

        let actions = ['find', 'get', 'create', 'update', 'remove', 'patch']
        const defaultPermissions = require('./schema/services/user/permissions')
        const permissions =
            `
            const appRoot = require('app-root-path');
            let externalPermission = null
            try {
                externalPermission = require(appRoot + '/hooks/user')
            } catch (e) {

            }
            const permissions = externalPermission && externalPermission().permissions || {
                admin: ['admin:*'],
                authenticated: [
                    ${ defaultPermissions.permissions.authenticated.map((t, typeIndex) => {
                return `'${t}'`
            }).join(", ")},
                    ${types.map((t, typeIndex) => {
                        let localActions = actions
                        if (typeIndex == 0) {

                            t.fields.map((f)=>{
                                f.directives.map((d)=>{
                                    if(d.name.value == "role"){
                                        d.arguments.map((args)=>{
                                            if(args.name.value == "onFind" && args.value.value == "own"){
                                                localActions.push("findOwn")
                                            }
                                        })
                                    }
                                })
                            })
                            return localActions.map((a, actionIndex) => {
                                // if(typeIndex ==0 && actionIndex == 0){
                                //     return `'${camelize(t.name)}:${a}'\n`
                                // }
                                return `'${camelize(t.name)}:${a}'`
                            }).join(", ")
                        }
                        return `\n` + localActions.map((a, actionIndex) => {
                            // if(typeIndex ==0 && actionIndex == 0){
                            //     return `'${camelize(t.name)}:${a}'\n`
                            // }
                            return `'${camelize(t.name)}:${a}'`
                        }).join(", ")
                    })}
                ],
                public: [
                    ${ defaultPermissions.permissions.public.map((t, typeIndex) => {
                return `'${t}'`
            }).join(", ")},
                    ${types.map((t, typeIndex) => {
                if (typeIndex == 0) {
                    return actions.filter((a) => a == "find" || a == "get").map((a, actionIndex) => {
                        // if(typeIndex ==0 && actionIndex == 0){
                        //     return `'${camelize(t.name)}:${a}'\n`
                        // }
                        return `'${camelize(t.name)}:${a}'`
                    }).join(", ")
                }
                return `\n` + actions.filter((a) => a == "find" || a == "get").map((a, actionIndex) => {
                    if (typeIndex == 0 && actionIndex == 0) {
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
    ncp('./schema/graphql', './outputs/graphql', function (err) {
        if (err) {
            return console.error(err);
        }

        hookUser(schema, types, "./outputs/services/user", "./outputs/graphql/user.js")
    })

    ncp(emailGraphql, "./outputs/graphql/email.js", function (err) {
        if (err) {
            return console.error(err);
        }

        // hookUser(schema, types, "./outputs/services/email", "./outputs/graphql/email.js")
    })



}

function addNewRequester(content, type, requesterName, requesters) {
    if (requesters.includes(requesterName)) {
        return content
    }
    requesters.push(requesterName)
    let contentSplitResponser = content.split(`${camelize(type)}Service.on`)
    let addNewRequester =
        `const ${pluralize.singular(camelize(requesterName))}Requester = new cote.Requester({
    name: '${pluralize.singular(requesterName)} Requester',
    key: '${pluralize.singular(camelize(requesterName))}',
})
`
    addNewRequester += `
         app.set('${pluralize.singular(camelize(requesterName))}Requester', ${pluralize.singular(camelize(requesterName))}Requester)\n
    `
    contentSplitResponser[0] += addNewRequester
    content = contentSplitResponser.join(`${camelize(type)}Service.on`)
    return content
}
async function main() {
    //create bucket
    let bucketName = await createBucket({
        Bucket: APP_NAME
    })

    if (!fs.existsSync("./outputs")) {
        fs.mkdirSync("./outputs")
    }

    //copy readme.me
    ncp("./schema/README.md", "./outputs/README.md")
    let types = []
    schema.definitions.filter((def) => !reservedTypes.includes(def.name.value)).filter((def) => !whitelistTypes.includes(def.kind)).map((def) => {
        fields = []

        def.fields.map((e) => {
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

    //generate email services
    ncp(emailServices, "./outputs/services/email", function (err) {
        if (err) {
            return console.error(err);
        }
    })
    //generate storage services
    ncp(storageServices, './outputs/services/storage', function (err) {
        if (err) {
            return console.log(err)
        }
    })
    //generate pushNotificationServices
    ncp(pushNotificationServices, './outputs/services/push-notification', function (err) {
        if (err) {
            return console.log(err)
        }
    })

    ncp(pushNotificationGraphql, './outputs/graphql/pushNotification.js', function (err) {
        if (err) {
            return console.log(err)
        }
    })

    generateAuthentiations(types)

    let outputGraphqlServer = generateGraphqlServer(types.map((t) => t.name))
    writeFile("./outputs/", "graphql", outputGraphqlServer)

    // graphql
    let outputGraphqlSchema = generateGraphqlSchema(schema)
    outputGraphqlSchema.map((s, index) => {
        writeFile(graphqlDirectiory, `${types[index].name}`, s)
    })


    generatePackageJSON(types.map((t) => t.name))


    //end of graphql
    types.map((e, index) => {
        if (!fs.existsSync(hooksDirectory)) {
            fs.mkdirSync(hooksDirectory)
        }
        if (!fs.existsSync(hooksDirectory + camelize(e.name) + '.js')) {
            ncp('./schema/hooks/example.js', hooksDirectory + camelize(e.name) + '.js', (err) => {
            })
        }


        //feathers
        if (!fs.existsSync(featherDirectory)) {
            fs.mkdirSync(featherDirectory)
        }
        const path = featherDirectory + camelize(e.name) + "/"

        if (!fs.existsSync(path)) {
            fs.mkdirSync(path)
        }
        const schemaExampleFeather = "./schema/services/example/"
        fs.readdir(schemaExampleFeather, function (err, fileName) {
            // const configPath = schemaExampleFeather+"config/"
            // fs.readdir(configPath, (err, file)=>{
            //     fs.readFile(configPath+"default.json", 'utf-8', (err,content)=>{
            //         const config = JSON.parse(content)
            //         config.port = defaultConfigService.port+index
            //         config.host = defaultConfigService.host
            //         config.mongodb = defaultConfigService.mongodb+camelize(e.name)+"_service"
            // if(!fs.existsSync(path+"config/")){
            //     fs.mkdirSync(path+"config/")
            // }
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
            fs.writeFileSync(path + ".env",
                "HOST=" + defaultConfigService.host + "\n" +
                "PORT=" + port + "\n" +
                // "MONGODB=" + defaultConfigService.mongodb + camelize(e.name) + "_service\n" +
                "MONGODB=" + defaultConfigService.mongodb + "rajakarcis\n" +
                "REDIS_HOST=" + defaultConfigService.redis.host + "\n" +
                "REDIS_PORT=" + defaultConfigService.redis.port + "\n"
            )
            // ncp(configPath+"default.json", path+"/config/default.json")
            ncp(schemaExampleFeather + "config.js", path + "config.js")
            ncp('./schema/config.js', './outputs/config.js')
            ncp('./schema/monitor.js', './outputs/monitor.js')
            // ncp('./schema/.env', './outputs/.env')
            fs.readFile('./schema/.env', (err, content) => {
                content = content.toString()
                content += '\nAPP_NAME=' + APP_NAME + "\n"
                content += 'BUCKET=' + bucketName + "\n"
                fs.writeFileSync('./outputs/.env', content)
            })
            // ncp(schemaExampleFeather+"config/custom-environment-variables.json", path+"config/custom-environment-variables.json")
            let requesters = ['user']
            fs.readFile(schemaExampleFeather + "index.js", (err, content) => {
                content = content.toString()
                content = content.replace(/examples/g, pluralize(camelize(e.name)))
                    .replace(/example/g, camelize(e.name))
                    .replace(/Example/g,  e.name.charAt(0).toUpperCase() + e.name.slice(1))


                e.fields.map((f) => {
                    //find related field
                    f.directives.map((directive) => {
                        // console.log(directive)
                        if (directive.name.value == "role") {
                            directive.arguments.map((args) => {
                                if (args.name.value == "onCreate") {
                                    if (args.value.value == "own") {
                                        
                                        let contentSplit = content.split("//beforeCreate")
                                        let beforeCreate =
                                            `
                                        context.data.${f.name}Id = auth.user.id
                                        //beforeCreate     
                                        `
                                        beforeCreate += contentSplit[1]
                                        // console.log(contentSplit[0])
                                        content = contentSplit[0] + beforeCreate
                                        // console.log(content)
                                        // content = addNewRequester(content, e.name, f.name, requesters)
                                    }
                                }

                                if (args.name.value == "onFind") {
                                    if (args.value.value == "own") {
                                        let contentSplit = content.split("//beforeFindAuthorization")
                                        contentSplit[0] += `
                                            if(context.params.type && context.params.type ==  "findOwn"){
                                                if(auth.user.permissions.includes("${camelize(e.name)}:findOwn")){
                                                    context.method = "findOwn"
                                                    context.params.query = {
                                                        ...context.params.query || {},
                                                        ${f.name}Id: auth.user.id
                                                    }
                                                }
                                            }
                                            
                                        `
                                        content = contentSplit[0] += contentSplit[1]
                                        contentSplit = content.split("//beforeFind")
                                        // let beforeFind  =
                                        //     `
                                        // context.params.query = {
                                        //     ...context.params.query || {},
                                        //     ${f.name}Id: auth.user.id
                                        // }
                                        // //beforeFind     
                                        // `
                                        // beforeFind += contentSplit[1]
                                        // // console.log(contentSplit[0])
                                        // content = contentSplit[0] + beforeFind
                                        // console.log(content)
                                        // content = addNewRequester(content, e.name, f.name, requesters)
                                    }
                                }

                                if (args.name.value == "onUpdateDelete") {
                                    if (args.value.value == "own") {
                                        let contentSplit = content.split("//beforePatch")
                                        let beforeUpdate =
                                            `
                                        if(context.id){
                                            let ${camelize(e.name)} = await app.service("${pluralize(camelize(e.name))}").get(context.id, { headers: context.params.headers })
                                            if(${camelize(e.name)} && ${camelize(e.name)}.${f.name}Id !== auth.user.id){
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
                                            let ${camelize(e.name)} = await app.service("${pluralize(camelize(e.name))}").get(context.id, { headers: context.params.headers })
                                            if(${camelize(e.name)} && ${camelize(e.name)}.${f.name}Id !== auth.user.id){
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

                    types.map((t) => {
                        if (pluralize.isSingular(f.name) && f.type == t.name) {
                            let contentSplit = content.split("//beforeCreate")
                            let beforeCreate =
                                `
                            //beforeCreate
                            if(context.data && context.data.${pluralize.singular(camelize(t.name))}Id){
                                let belongsTo = await ${pluralize.singular(camelize(t.name))}Requester.send({ 
                                    type: "get", 
                                    id: context.data.${pluralize.singular(camelize(t.name))}Id, 
                                    headers:{
                                        token: context.params.headers.authorization
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
                    f.directives.map((d) => {
                        //hook on delete 
                        if (d.name.value == "relation") {
                            let directiveRelationOnDelete = d.arguments[0].value.value
                            let onDelete = onDeleteRelations(directiveRelationOnDelete, pluralize.singular(camelize(f.name)), pluralize.singular(camelize(e.name)))
                            let contentSplit = content.split("//onDelete")
                            onDelete += contentSplit[1]
                            content = contentSplit[0] + onDelete
                            content = addNewRequester(content, e.name, f.name, requesters)
                        }

                        if (d.name.value == "File") {
                            content = addNewRequester(content, e.name, "Storage", requesters)

                            let contentSplit = content.split("//afterCreate")
                            let hookStorageAfterCreate = `
                                storageRequester.send({
                                    type: "uploadFile",
                                    body: {
                                        buffer: context.params.file.buffer,
                                        key: context.params.file.key,
                                        mimeType: context.params.file.mimeType,
                                        bucket: context.params.file.bucket
                                    }
                                })
                            `
                            hookStorageAfterCreate += contentSplit[1]
                            content = contentSplit[0] + hookStorageAfterCreate

                            content = content.split("//afterPatch")
                            let hookStorageAferUpdate = `
                                if (context.result.length > 0) {
                                    storageRequester.send({
                                        type: "uploadFile",
                                        body: {
                                            buffer: context.params.file.buffer,
                                            key: context.result.image.split(".com/")[1],
                                            mimeType: context.params.file.mimeType,
                                            bucket: context.params.file.bucket
                                        }
                                    })
                                }
                            `
                            hookStorageAferUpdate += content[1]
                            content = content[0] + hookStorageAferUpdate

                            content = content.split("//afterDelete")
                            let hookStorageAferDelete = `
                                if (context.result.length > 0) {
                                    storageRequester.send({
                                        type: "deleteFile",
                                        body: {
                                            key: context.result.image.split(".com/")[1],
                                            bucket: context.params.file.bucket
                                        }
                                    })
                                }
                            `
                            hookStorageAferDelete += content[1]
                            content = content[0] + hookStorageAferDelete
                        }
                    })
                })


                //remove unused comments
                content = content.replace(/\/\/onDelete/g, "").replace(/\/\/beforeCreate/g, "")
                // console.log("cc", content)
                fs.writeFileSync(path + "index.js", beautify(content))
            })

            const srcPath = schemaExampleFeather + "src/"
            //read src
            fs.readdir(srcPath, (err, file) => {
                if (!fs.existsSync(path + "src/")) {
                    fs.mkdirSync(path + "src/")
                }

                file.map((fileName) => {
                    fs.readFile(srcPath + fileName, (err, content) => {
                        content = content.toString().replace(/examples/g, pluralize(camelize(e.name)))
                            .replace(/example/g, camelize(e.name))
                            .replace(/Example/g, e.name.charAt(0).toUpperCase() + e.name.slice(1))

                        if (fileName == "model.js") {
                            content = "module.exports = function (app) {\n"
                            content += "const mongooseVirtuals = require('mongoose-lean-virtuals');\n"
                            content += "const mongooseClient = app.get('mongooseClient');\n"
                            content += `const model = new mongooseClient.Schema({\n`
                            //fields
                            e.fields.map((f) => {
                                if (f.type == "User") {
                                    content += `${f.name}Id: { type: String, required: ${f.required} },`
                                }
                                types.map((t) => {
                                    if (t.name == f.type && f.kind !== "ListType") {

                                        content += `${camelize(f.name) + "Id"}: { type: String, required: ${f.required} },`
                                    }
                                })
                                let defaultValue = null
                                f.directives.map((d) => {
                                    if (d.name.value == "default") {
                                        defaultValue = d.arguments[0].value.value
                                    }
                                })
                                if (f.name !== "_id" && f.name !== "id" && primitiveTypes.includes(f.type) && f.kind !== "ListType") {
                                    if (defaultValue && defaultValue !== false) {
                                        content += `${f.name}: { type: ${convertToFeatherTypes(f.type)}, required: ${f.required}, default: "${defaultValue}" },`
                                    } else if (defaultValue === false) {
                                        content += `${f.name}: { type: ${convertToFeatherTypes(f.type)}, required: ${f.required}, default: ${defaultValue} },`
                                    } else {
                                        content += `${f.name}: { type: ${convertToFeatherTypes(f.type)}, required: ${f.required} },`
                                    }

                                }
                            })
                            content += `
                                },{
                                    timestamps: true
                                })
                                    model.virtual('id').get(function () {
                                        return this._id
                                    })
                                    model.set('toObject', { virtuals: true })
                                    model.set('toJSON', { virtuals: true })
                                    model.plugin(mongooseVirtuals)
                                    return mongooseClient.model("${pluralize(camelize(e.name))}", model)
                                }
                            `
                        }
                        // console.log(content)
                        fs.writeFileSync(path + "src/" + fileName, beautify(content))
                        fs.readFile('./schema/services/email/.env', (err, content) => {
                            content = content.toString()
                            content += '\nAPP_NAME=' + APP_NAME + "\n"
                            fs.writeFileSync('./outputs/services/email/.env', content)
                        })
                        fs.readFile('./schema/services/user/.env', (err, content) => {
                            content = content.toString()
                            content += '\nAPP_NAME=' + APP_NAME + "\n"
                            fs.writeFileSync('./outputs/services/user/.env', content)
                        })
                    })
                })
            })
        })
        //end of feathers
    })
}
main()
