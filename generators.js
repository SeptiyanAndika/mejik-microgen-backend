const fs = require("fs")
const pluralize = require('pluralize')
const { camelize, beautify } = require("./utils")

const isRelation = (types, name) => {
    if (types.includes(name)) {
        console.log(name.toLowerCase() + "Id")
        return name.toLowerCase() + "Id"
    }
}

const field = (types, name, type, directives) => {
    let fieldName = name
    let fieldType = type.kind == "NamedType" ? type.name.value : type.type.name.value
    directives.map((d) => {
        if (d.name.value == "File") {
            fieldType = "Upload"
        }
    })
    if (type.name && types.includes(camelize(type.name.value))) {
        fieldName = camelize(name) + "Id"
        fieldType = "String"
    } else {
        if (types.includes(name) || fieldType == "User") {
            fieldName = camelize(name) + "Id"
            fieldType = "String"
        }
    }
    if (type.kind == "NonNullType") {
        return `${fieldName} : ${fieldType}!`
    }
    return `${fieldName} : ${fieldType}`
}

const fieldType = (field) => {
    if (field.kind == "NonNullType") {
        return field.type.name.value
    }
    if (field.kind == "ListType") {
        return `[${field.type.name.value}]`
    }
    return field.name.value
}

const generatePM2Script = (types) =>{
    let script = {
        apps: [{
            name: "Graphql Service",
            script: "npm run graphql"
        },{
            name: "User Service",
            script: "npm run user-services"
        },{
            name: "Email Service",
            script: "npm run email-services"
        },{
            name: "Storage Service",
            script: "npm run storage-services"
        },{
            name: "Push Notification Servic",
            script: "npm run pushNotification-services"
        }]
    }
    types.map((type)=>{
        script.apps.push({
            "name": `type Service`,
            "script": `npm run ${camelize(type)}-services`
        })
    })
    fs.writeFileSync("./outputs/pm2.json", JSON.stringify(script, null, 4))
}
const generatePackageJSON = (types) => {
    let packageJSON = fs.readFileSync("./schema/package.json")
    packageJSON = JSON.parse(packageJSON.toString())
    packageJSON["scripts"]["graphql"] = "nodemon --exec babel-node graphql --presets env"
    packageJSON["scripts"]["user-services"] = "cd ./services/user && nodemon index.js"
    packageJSON["scripts"]["email-services"] = "cd ./services/email && nodemon index.js"
    packageJSON["scripts"]["storage-services"] = "cd ./services/storage && nodemon index.js"
    packageJSON["scripts"]["pushNotification-services"] = "cd ./services/push-notification && nodemon index.js"
    types.map((type) => {
        packageJSON["scripts"][`${camelize(type)}-services`] = "cd ./services/" + camelize(type) + " && nodemon index.js"
    })

    packageJSON["scripts"]["dev"] = `npm-run-all --parallel graphql email-services pushNotification-services storage-services user-services ${types.map((type) => `${camelize(type)}-services`).join(" ")}`

    fs.writeFileSync("./outputs/package.json", JSON.stringify(packageJSON, null, 4))
    generatePM2Script(types)
}

const generateGraphqlServer = (types) => {
    let content = ""
    content += `import { REDIS_HOST, REDIS_PORT, APP_NAME, BUCKET } from './config'\n`
    content += `import { merge } from 'lodash'\n`
    content += `import express from 'express'\n`
    content += `import { ApolloServer, makeExecutableSchema, gql, GraphQLUpload } from 'apollo-server-express'\n`
    content += `import { createRateLimitTypeDef, createRateLimitDirective, defaultKeyGenerator} from 'graphql-rate-limit-directive'\n`
    content += `import { GraphQLScalarType } from 'graphql'\n`
    content += `import GraphQLJSON from 'graphql-type-json'\n\n`
    content += `import { PubSub } from 'graphql-subscriptions'\n`
    content += `import { typeDef as User, resolvers as userResolvers } from './graphql/user'\n`
    content += `import { typeDef as Email, resolvers as emailResolvers } from './graphql/email'\n`
    content += `import { typeDef as PushNotification, resolvers as pushNotificationResolvers } from './graphql/pushNotification'\n`
    //import all type and resolvers
    types.map((type) => {
        content += `import { typeDef as ${type}, resolvers as ${camelize(type)}Resolvers } from './graphql/${camelize(type)}'\n`
    })
    content += `const { injectConfigFromHook } = require('./utils/hookGraphql')\n`
    content +=
        `const pubSub = new PubSub()\n` +
        `const Prometheus = require('./monitor')\n` +
        `\nconst cote = require('cote')({ redis: { host: REDIS_HOST, port: REDIS_PORT } })\n` +
        "const typeDefs = gql`\n" +
        "   type Query { default: String }\n" +
        "   type Response { message: String }\n" +
        "   type Mutation { default: String }\n" +
        "   type Subscription { default: String }\n" +
        "   scalar Timestamp\n"+
        "   scalar JSON\n" +
        "   scalar Upload\n" +
        "   scalar Date\n`" +
        `
        const resolver = {
            JSON: GraphQLJSON,
            Upload: GraphQLUpload,
            Date: new GraphQLScalarType({
                name: 'Date',
                description: 'Date custom scalar type',
                parseValue(value) {
                    return new Date(value); // value from the client
                },
                serialize(value) {
                    return new Date(value).toString() // value sent to the client
                },
                parseLiteral(ast) {
                    if (ast.kind === Kind.INT) {
                        return parseInt(ast.value, 10); // ast value is always in string format
                    }
                    return null;
                },
            }),
            Timestamp: new GraphQLScalarType({
                name: 'Timestamp',
                serialize(date) {
                    console.log("serialize", date)
                return (date instanceof Date) ? date.getTime() : null
                },
                parseValue(value) {
                try {
              
                    let valid = new Date(value).getTime() > 0;
                    if(!valid){
                        throw new UserInputError("Date is not valid")
                    }
                    return value
                    }
                catch (error) { 
                    throw new UserInputError("Date is not valid")
                }
                },
                parseLiteral(ast) {
                    console.log("ast", ast)
                if (ast.kind === Kind.INT) {
                    return new Date(parseInt(ast.value, 10));
                }
                else if (ast.kind === Kind.STRING) {
                    return this.parseValue(ast.value);
                }
                else {
                    return null;
                }
                },
            })
        }`

    content +=
        `
        const schema = makeExecutableSchema({
            typeDefs: [ typeDefs, createRateLimitTypeDef(), injectConfigFromHook("user", User), injectConfigFromHook("email", Email), injectConfigFromHook("pushNotification", PushNotification), ${types.map(t=> `injectConfigFromHook('${camelize(t)}', ${t})`).join(", ")}],
            resolvers: merge(resolver,  userResolvers, emailResolvers,pushNotificationResolvers, ${types.map((t) => camelize(t) + "Resolvers({ pubSub })").join(", ")}),
            schemaDirectives: {
                rateLimit: createRateLimitDirective({
                    keyGenerator
                }),
            },
        });
        `

    content += `
        const userRequester = new cote.Requester({ 
            name: 'User Requester', 
            key: 'user',
        })      
            `

    content += `
        const storageRequester = new cote.Requester({ 
            name: 'Storage Requester', 
            key: 'storage',
        })      
        `


    content += `
        const emailRequester = new cote.Requester({ 
            name: 'Email Requester', 
            key: 'email',
        })      
            `

    content += `
        const pushNotificationRequester = new cote.Requester({ 
            name: 'Push Notification Requester', 
            key: 'pushNotification',
        })      
            `
    //requster
    types.map((t) => {
        content += `
            const ${camelize(t) + "Requester"} = new cote.Requester({ 
                name: '${t} Requester', 
                key: '${camelize(t)}',
            })
        `
    })

    content += `
    const uuid = ()=>{
        return Math.random().toString(36).substring(7)
    }\n

    const keyGenerator = (directiveArgs, obj, args, context, info) => 
    `+"`${context.ip}:${defaultKeyGenerator("
    + "         obj,\n"
    + "         args,\n"
    + "         context,\n"
    + "         directiveArgs,\n"
    +"      )}`"

    content += `
        const parseBearerToken = (headers)=>{
            return Object.assign(headers, {
                authorization: headers.authorization ? headers.authorization.split(" ")[1] : null
            })
        }\n`
    //create context
    content += `
        const context = ({ req, connection}) => {
            return {
                bucket: BUCKET,
                uuid,
                ip: req.ip,
                storageUrl: "https://"+BUCKET+".s3-ap-southeast-1.amazonaws.com/",
                headers: !connection && parseBearerToken(req.headers),
                userRequester,
                storageRequester,
                emailRequester,
                pushNotificationRequester,
                ${types.map((e) => camelize(e) + "Requester").join(", ")}
            }
        }\n`

    content += `
        const server = new ApolloServer({
            schema, 
            context
        })


        const app = express();

        app.use(Prometheus.requestCounters);  
        app.use(Prometheus.responseCounters);

        /**
        * Enable metrics endpoint
        */
        Prometheus.injectMetricsRoute(app);

        /**
        * Enable collection of default metrics
        */
        Prometheus.startCollection();
        server.applyMiddleware({ app });

        app.listen({port: 4000})
    `
    return beautify(content)
}

const whitelistTypes = ['DirectiveDefinition', 'ScalarTypeDefinition', 'EnumTypeDefinition']
const reservedTypes = ['User']
const generateGraphqlSchema = (schema) => {
    let contents = []
    let types = ["user"]
    let filesTypes = []
    for (let i = 0; i < schema.definitions.length; i++) {
        if (reservedTypes.includes(schema.definitions[i].name.value)) {
            continue
        }
        if (whitelistTypes.includes(schema.definitions[i].kind)) {
            continue
        }
        let typeName = pluralize.singular(schema.definitions[i].name.value)
        types.push(camelize(typeName))
    }
    for (let i = 0; i < schema.definitions.length; i++) {

        if (reservedTypes.includes(schema.definitions[i].name.value)) {
            continue
        }
        if (whitelistTypes.includes(schema.definitions[i].kind)) {
            continue
        }
        let typeName = pluralize.singular(schema.definitions[i].name.value)
        let content = "export const typeDef = `\n"
        let type = `    type ${typeName} {\n`

        //defaultId
        type += `       id: String \n`

        let relationTypes = []
        schema.definitions[i].fields.map((e) => {
            // console.log("1/111", e)
            // let isFile = false

            // console.log("isfile", isFile)
            // if(types.includes(e.name.value)){
            //     console.log(types, e.name.value, e.type.kind)
            //     relationTypes.push(e.name.value)
            // }
            //hasmany
            // if(e.type.type){
            //     console.log(e.type.type.name.value)
            // }
            if (e.type.type) {

                if (types.includes(camelize(e.type.type.name.value))) {
                    // for(let j = 0; j < schema.definitions.length ; j++){
                    //     if(schema.definitions[j].name.value == e.type.type.name.value){
                    //         for(let k = 0; k < schema.definitions[j].fields.length; k ++){
                    //             schema.definitions[j].fields[k].directives.map((d)=>{
                    //                 if(d.name.value == "File"){
                    //                     isFile = true
                    //                 }
                    //             })
                    //         }
                    //     }
                    // }
                    relationTypes.push({
                        name: e.name.value,
                        relatedTo: camelize(e.type.type.name.value),
                        type: e.type.kind,
                    })

                    // if(isFile){
                    //     type += `       ${e.name.value} (query: JSON): Upload \n`
                    // }else{
                    type += `       ${e.name.value} (query: JSON): ${fieldType(e.type)} \n`
                    // }


                } else {
                    type += `       ${e.name.value}: ${fieldType(e.type)} \n`
                }
            } else {
                if (e.type.name.value) {

                    if (types.includes(camelize(e.type.name.value))) {
                        relationTypes.push({
                            name: e.name.value,
                            relatedTo: camelize(e.type.name.value),
                            type: e.type.kind
                        })

                        type += `       ${e.name.value} (query: JSON): ${fieldType(e.type)} \n`
                    } else {
                        type += `       ${e.name.value}: ${fieldType(e.type)} \n`
                    }
                } else {
                    type += `       ${e.name.value}: ${fieldType(e.type)} \n`
                }

            }
        })
        type += "    }\n"

        let typeConnection = `    type ${typeName}Connection {\n`
        typeConnection += `       total: Int \n`
        typeConnection += `       limit: Int \n`
        typeConnection += `       skip: Int \n`
        typeConnection += `       data: [${typeName}] \n`
        typeConnection += "    }\n"

        type += typeConnection

        let queriesPrepend = "    extend type Query {"
        let queriesAppend = "\n    } \n"

        let input = ""

        let subscriptionPrepend = "    extend type Subscription {"
        let subscriptionAppend = "\n    }\n"

        let mutationPrepend = "    extend type Mutation {"
        let mutationAppend = "\n    }\n"

        let files = []

        //
        input += `    input ${typeName}Input {\n`
        let isHasFindOwn = false
        schema.definitions[i].fields.map((e) => {
            let role = []
            let isFile = false
            e.directives.map((d) => {
                if (d.name.value == "role") {
                    d.arguments.map((args) => {
                        if (args.name.value == "onCreate") {
                            if (args.value.value == "own") {
                                role.push(args.value.value)
                                return
                            }
                        }
                        if (args.name.value == "onFind") {
                            if (args.value.value == "own") {
                                isHasFindOwn = true
                            }
                        }
                    })
                }
                if (d.name.value == "File") {
                    // filesTypes.push(schema.definitions[i])
                    files.push(e)
                }
            })
            // for(let j = 0; j < schema.definitions.length ; j++){
            //     if(e.type.type){
            //         if(schema.definitions[j].name.value == e.type.type.name.value){
            //             for(let k = 0; k < schema.definitions[j].fields.length; k ++){
            //                 schema.definitions[j].fields[k].directives.map((d)=>{
            //                     if(d.name.value == "File"){
            //                         isFile = true
            //                         console.log("isfileeee")
            //                     }
            //                 })
            //             }
            //         }
            //     }
            // }
            if (!role.includes("own") && e.type.kind !== "ListType" && e.name.value !== "id") {
                input += `       ${field(types, e.name.value, e.type, e.directives)}\n`
            }
        })
        input += "    }\n\n"
        queriesPrepend += `\n        ${camelize(pluralize(typeName))} (query: JSON): [${typeName}]`
        queriesPrepend += `\n        ${camelize(pluralize.singular(typeName))} (id: String!): ${typeName}`
        queriesPrepend += `\n        ${camelize(pluralize(typeName))}Connection (query: JSON): ${typeName}Connection`

        //check findown
        if(isHasFindOwn){
            queriesPrepend += `\n        ${camelize(pluralize(typeName))}Own (query: JSON): [${typeName}]`
            queriesPrepend += `\n        ${camelize(pluralize(typeName))}ConnectionOwn (query: JSON): ${typeName}Connection`
        }

        subscriptionPrepend += `\n       ${camelize(typeName)}Added: ${typeName}`
        subscriptionPrepend += `\n       ${camelize(typeName)}Updated: ${typeName}`
        subscriptionPrepend += `\n       ${camelize(typeName)}Deleted: ${typeName}`

        mutationPrepend += `\n       create${typeName}(input: ${typeName}Input): ${typeName}`
        mutationPrepend += `\n       update${typeName}(input: ${typeName}Input, id: String): ${typeName}`
        mutationPrepend += `\n       delete${typeName}(id: String): ${typeName}`


        const queries = queriesPrepend + queriesAppend
        const mutations = mutationPrepend + mutationAppend
        const subscriptions = subscriptionPrepend + subscriptionAppend
        let result = type + "\n" + queries + "\n" + input + subscriptions + mutations
        content += result + "`\n"

        //resolver
        let resolvers = "export const resolvers = ({ pubSub }) => ({\n"
        let resolverQueries = "    Query: {\n"
        let resolverMutations = "    Mutation : {\n"
        let resolverSubscriptions = "    Subscription : {\n"
        let resolverRelations = ""
        let typeNames = []
        for (let i = 0; i < schema.definitions.length; i++) {
            if (reservedTypes.includes(schema.definitions[i].name.value)) {
                continue
            }
            if (whitelistTypes.includes(schema.definitions[i].kind)) {
                continue
            }
            let typeName = schema.definitions[i].name.value
            typeNames.push(typeName)
        }

        let requester = camelize(typeName) + "Requester"
        //findall
        resolverQueries += `${camelize(pluralize(typeName))}: async(_, { query }, { ${typeNames.map((e) => camelize(e) + "Requester").join(", ")}, headers })=>{\n`
        resolverQueries += `    if (query && query.id) {\n`
        resolverQueries += `        query._id = query.id\n`
        resolverQueries += `        delete query.id }\n`
        resolverQueries += `        try{ \n`
        resolverQueries += `            return await ${requester}.send({ type: 'find', query, headers})\n`
        resolverQueries += `        }catch(e){ \n`
        resolverQueries += `            throw new Error(e)`
        resolverQueries += `        }\n`
        resolverQueries += "}, \n"

        //single
        resolverQueries += `${camelize(pluralize.singular(typeName))}: async(_, { id }, { ${typeNames.map((e) => camelize(e) + "Requester").join(", ")}, headers })=>{\n`
        resolverQueries += `        try{ \n`
        resolverQueries += `            return await ${requester}.send({ type: 'get', id, headers })\n`
        resolverQueries += `        }catch(e){ \n`
        resolverQueries += `            throw new Error(e)`
        resolverQueries += `        }\n`
        resolverQueries += "}, \n"

        //connections
        resolverQueries += `${camelize(pluralize(typeName))}Connection: async(_, { query }, { ${typeNames.map((e) => camelize(e) + "Requester").join(", ")}, headers })=>{\n`
        resolverQueries += `    if (query && query.id) {\n`
        resolverQueries += `        query._id = query.id\n`
        resolverQueries += `        delete query.id }\n`
        resolverQueries += `        try{ \n`
        resolverQueries += `            return await ${requester}.send({ type: 'findConnection', query, headers})\n`
        resolverQueries += `        }catch(e){ \n`
        resolverQueries += `            throw new Error(e)`
        resolverQueries += `        }\n`
        resolverQueries += "}, \n"

        if(isHasFindOwn){
            //findall
            resolverQueries += `${camelize(pluralize(typeName))}Own: async(_, { query }, { ${typeNames.map((e) => camelize(e) + "Requester").join(", ")}, headers })=>{\n`
            resolverQueries += `    if (query && query.id) {\n`
            resolverQueries += `        query._id = query.id\n`
            resolverQueries += `        delete query.id }\n`
            resolverQueries += `        try{ \n`
            resolverQueries += `            return await ${requester}.send({ type: 'findOwn', query, headers})\n`
            resolverQueries += `        }catch(e){ \n`
            resolverQueries += `            throw new Error(e)`
            resolverQueries += `        }\n`
            resolverQueries += "}, \n"

            //connections
            resolverQueries += `${camelize(pluralize(typeName))}ConnectionOwn: async(_, { query }, { ${typeNames.map((e) => camelize(e) + "Requester").join(", ")}, headers })=>{\n`
            resolverQueries += `    if (query && query.id) {\n`
            resolverQueries += `        query._id = query.id\n`
            resolverQueries += `        delete query.id }\n`
            resolverQueries += `        try{ \n`
            resolverQueries += `            return await ${requester}.send({ type: 'findConnectionOwn', query, headers})\n`
            resolverQueries += `        }catch(e){ \n`
            resolverQueries += `            throw new Error(e)`
            resolverQueries += `        }\n`
            resolverQueries += "}, \n"
        }

        if (relationTypes.length > 0) {
            resolverRelations += `    ${typeName}: {\n`

            relationTypes.map((e) => {
                if (e.type == "ListType") {
                    resolverRelations += `${pluralize(e.name)}: async ({ id }, { query }, { headers, ${pluralize.singular(e.relatedTo)}Requester })=>{\n`
                    resolverRelations += `        try{ \n`
                    resolverRelations += `          return await ${pluralize.singular(e.relatedTo)}Requester.send({ type: 'find', query: Object.assign({ ${camelize(typeName)}Id: id }, query), headers })\n`
                    resolverRelations += `        }catch(e){ \n`
                    resolverRelations += `            throw new Error(e)`
                    resolverRelations += `        }\n`
                    resolverRelations += `  },\n`
                } else {
                    resolverRelations += `${e.name}: async ({ ${e.name}Id }, args, { headers, ${e.relatedTo}Requester })=>{\n`
                    resolverRelations += `        try{ \n`
                    resolverRelations += `            return await ${e.relatedTo}Requester.send({ type: 'get', id: ${e.name}Id, headers })\n`
                    resolverRelations += `        }catch(e){ \n`
                    resolverRelations += `            throw new Error(e)`
                    resolverRelations += `        }\n`
                    
                    resolverRelations += `},\n`
                }

            })
            resolverRelations += `    },\n`
        }

        // console.log("schema definitions", schema.definitions[i].fields)

        let relationFile = []
        // schema.definitions[i].fields.map((f)=>{
        //     // console.log("ff", f)
        //     if(f.type.type){
        //         filesTypes.map((ft)=>{
        //             if(ft.name.value ==  f.type.type.name.value){
        //                 console.log("fields", f)
        //                 relationFile.push(f.name.value)
        //                 // console.log("have relation", f.type.type.name.value)
        //             }
        //         })
        //     }
        // })
        // console.log("fttt", filesTypes, )
        // console.log("relation file", relationFile)
        if (files.length > 0) {
            let file = files[0].name.value
            resolverMutations += `
                create${typeName}: async(_, { input = {} }, { ${typeNames.map((e) => camelize(e) + "Requester").join(", ")}, headers, bucket, uuid, storageUrl, storageRequester })=>{
                    try{
                        if(input.${file}){
                            let image${typeName} = await input.${file}
                            const key = "${camelize(typeName)}/"+uuid()+"."+image${typeName}.mimetype.split("/")[1]
                            const url = storageUrl+key
                            input.${file} = url
                            const rs = image${typeName}.createReadStream()
                            let buffers = []
                            return new Promise((resolve, reject)=>{
                                rs.on('data', async (data) => {
                                    buffers.push(data)
                                })
                                rs.on('end', async (data)=>{
                                    let buffer = Buffer.concat(buffers)
                                    const ${camelize(typeName)} = ${camelize(typeName)}Requester.send({ 
                                        type: 'create', 
                                        body: input,
                                        headers, 
                                        file: {
                                            buffer,
                                            key,
                                            mimeType: image${typeName}.mimetype,
                                            bucket
                                        }
                                    })
                                    pubSub.publish("${camelize(typeName)}Added", { ${camelize(typeName)}Added: ${camelize(typeName)} })
                                    resolve(${camelize(typeName)})
                                })
                            })
                        }else{
                            let ${camelize(typeName)} = await ${camelize(typeName)}Requester.send({ type: 'create', body: input, headers })
                            pubSub.publish("${camelize(typeName)}Added", { ${camelize(typeName)}Added: ${camelize(typeName)} })
                            return ${camelize(typeName)}
                        }
                    }catch(e){
                        throw new Error(e)
                    }
                },
            `
        } else {
            resolverMutations += `create${typeName}: async(_, { input = {} }, { ${typeNames.map((e) => camelize(e) + "Requester").join(", ")}, headers })=>{
                try{
                    let data = await ${requester}.send({ type: 'create', body: input, headers})
                    pubSub.publish("${camelize(typeName)}Added", { ${camelize(typeName)}Added: data })
                    return data
                }catch(e){
                    throw new Error(e)
                }
            },`
        }


        if (files.length > 0) {
            let file = files[0].name.value
            resolverMutations += ` 
                update${typeName}: async (_, { input = {}, id }, { ${typeNames.map((e) => camelize(e) + "Requester").join(", ")}, headers, bucket, uuid, storageUrl, storageRequester }) => {
                    try{
                        if (input.${file}) {
                            let image${typeName} = await input.${file}
                            delete input.${file}
  
                            const rs = image${typeName}.createReadStream()
                            let buffers = []
                            return new Promise((resolve, reject)=>{
                                rs.on('data', async (data) => {
                                    buffers.push(data)
                                })
                                rs.on('end', async (data)=>{
                                    let buffer = Buffer.concat(buffers)
                                    const ${camelize(typeName)} = await ${camelize(typeName)}Requester.send({ 
                                        type: 'patch', 
                                        body: input, 
                                        id, 
                                        headers,
                                        file: {
                                            buffer,
                                            mimeType: image${typeName}.mimetype,
                                            bucket
                                        }
                                    })
                                    pubSub.publish("${camelize(typeName)}Updated", { ${camelize(typeName)}Updated: ${camelize(typeName)} })
                                    resolve(${camelize(typeName)})
                                })
                            
                            })
                        }else{
                            let ${camelize(typeName)} = await ${camelize(typeName)}Requester.send({ type: 'patch', body: input, id, headers })
                            pubSub.publish("${camelize(typeName)}Updated", { ${camelize(typeName)}Updated: ${camelize(typeName)} })
                            return ${camelize(typeName)}
                        }
                    }catch(e){
                        throw new Error(e)
                    }

                },`
        } else {
            resolverMutations += `update${typeName}: async(_, { input = {} , id }, { ${typeNames.map((e) => camelize(e) + "Requester").join(", ")}, headers })=>{
                try{
                    let data = await ${requester}.send({ type: 'patch', body: input, id, headers})
                    pubSub.publish("${camelize(typeName)}Updated", { ${camelize(typeName)}Updated: data })
                    return data
                }catch(e){
                    throw new Error(e)
                }
            },`
        }

        if (files.length > 0) {
            resolverMutations += `
                delete${typeName}: async (_, { id }, { ${typeNames.map((e) => camelize(e) + "Requester").join(", ")}, headers, bucket, uuid, storageUrl, storageRequester }) => {
                    try{
                        let ${camelize(typeName)} = await ${camelize(typeName)}Requester.send({ type: 'delete', id, headers })
                        if(${camelize(typeName)}.url){
                            const key = ${camelize(typeName)}.url.split(storageUrl).join("")
                            storageRequester.send({
                                type:"deleteFile",
                                body:{
                                    bucket,
                                    key
                                }
                            })
                        }
                        pubSub.publish("${camelize(typeName)}Deleted", { ${camelize(typeName)}Deleted: ${camelize(typeName)} })
                        return ${camelize(typeName)}
                    }catch(e){
                        throw new Error(e)
                    }
                },
            `
        } else {
            resolverMutations += `delete${typeName}: async(_, { id }, { ${typeNames.map((e) => camelize(e) + "Requester").join(", ")}, headers })=>{
                try{
                    let data = await ${requester}.send({ type: 'delete', id,  headers})
                    pubSub.publish("${camelize(typeName)}Deleted", { ${camelize(typeName)}Deleted: data })
                    return data
                }catch(e){
                    throw new Error(e)
                }
            },`
        }


        resolverSubscriptions += `${camelize(typeName)}Added: {\n`
        resolverSubscriptions += `  subscribe: () => pubSub.asyncIterator('${camelize(typeName)}Added')\n`
        resolverSubscriptions += "}, \n"

        resolverSubscriptions += `${camelize(typeName)}Updated: {\n`
        resolverSubscriptions += `  subscribe: () => pubSub.asyncIterator('${camelize(typeName)}Updated')\n`
        resolverSubscriptions += "}, \n"

        resolverSubscriptions += `${camelize(typeName)}Deleted: {\n`
        resolverSubscriptions += `  subscribe: () => pubSub.asyncIterator('${camelize(typeName)}Deleted')\n`
        resolverSubscriptions += "}, \n"



        resolverQueries += "}, \n"
        resolverMutations += "}, \n"
        resolverSubscriptions += "}, \n"
        //end of queries
        resolvers += resolverQueries + resolverRelations + resolverSubscriptions + resolverMutations + "})"
        content += resolvers

        contents.push(beautify(content))
    }
    return contents
}

onDeleteRelations = (type, relatedTable, foreignId) => {
    switch (type) {
        case "SET_NULL":
            return `
                //onDelete
                //ON DELETE SET NULL
                await ${relatedTable}Requester.send({ type: 'patch', 
                    id: null,   
                    headers: {
                        authorization: context.params.headers.authorization
                    }, 
                    body: {
                        ${foreignId}Id: null
                    },
                    params: {
                        query: {
                            ${foreignId}Id: context.id
                        }
                    }
                })`
        case "CASCADE":
            return `
                //onDelete
                //ON DELETE SET CASCADE
                await ${relatedTable}Requester.send({ type: 'delete', 
                    id: null,   
                    headers: {
                        authorization: context.params.headers.authorization
                    }, 
                    params: {
                        query: {
                            ${foreignId}Id: context.id
                        }
                    }
                })`
        case "RESTRICT":
            return `
                //onDelete
                //ON DELETE SET RESTRICT
                let ${pluralize(relatedTable)} = await ${relatedTable}Requester.send({ 
                    type: 'find', 
                    query: {
                        ${foreignId}Id: context.id
                    }, 
                    headers: {
                        authorization: context.params.headers.authorization
                    }
                })
                if(${pluralize(relatedTable)}.length > 0){
                    throw Error("Failed delete", null)
                }
            `
        default:
            return `
                //onDelete
                //ON DELETE SET NULL
                await ${relatedTable}Requester.send({ type: 'patch', 
                    id: null,   
                    headers: {
                        authorization: context.params.headers.authorization
                    }, 
                    body: {
                        ${foreignId}Id: null
                    },
                    params: {
                        query: {
                            ${foreignId}Id: context.id
                        }
                    }
                })`
    }
}

module.exports = {
    generateGraphqlSchema,
    generateGraphqlServer,
    generatePackageJSON,
    whitelistTypes,
    reservedTypes,
    onDeleteRelations,
    fieldType
}