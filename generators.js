const fs = require("fs")
const pluralize = require('pluralize')
const { camelize, beautify } = require("./utils")
const config = JSON.parse(fs.readFileSync("./config.json").toString())

const isRelation = (types, name) =>{
    if(types.includes(name)){
        console.log(name.toLowerCase()+"Id")
        return name.toLowerCase()+"Id"
    }
}

const field = (types, name, type) =>{
    let fieldName = name
    let fieldType = type.kind == "NamedType" ?  type.name.value  : type.type.name.value
    if(types.includes(name) || fieldType == "User"){
        fieldName =  camelize(name)+"Id"
        fieldType = "String"
    }
    if(type.kind == "NonNullType"){
        return `${fieldName} : ${fieldType}!`
    }
    return `${fieldName} : ${fieldType}`
}

const fieldType = (field)=>{
    if(field.kind == "NonNullType"){
        return field.type.name.value
    }
    if(field.kind == "ListType"){
        return `[${field.type.name.value}]`
    }
    return field.name.value
}

const generatePackageJSON = (types) =>{
    let packageJSON = fs.readFileSync("./schema/package.json")
    packageJSON = JSON.parse(packageJSON.toString())
    packageJSON["scripts"]["graphql"] = "nodemon --exec babel-node graphql --presets env"
    packageJSON["scripts"]["user-services"] = "cd "+config.services.src+"user && nodemon index.js"
    types.map((type)=>{
        packageJSON["scripts"][`${camelize(type)}-services`] = "cd "+config.services.src+camelize(type)+ " && nodemon index.js"
    })

    packageJSON["scripts"]["dev"] = `npm-run-all --parallel graphql user-services ${types.map((type)=> `${camelize(type)}-services`).join(" ")}`

    fs.writeFileSync(config.src+"package.json", JSON.stringify(packageJSON,null,4))
}

const generateGraphqlServer = (types) =>{
    let content = ""
    content += `import { REDIS_HOST, REDIS_PORT } from './config'\n`
    content += `import { merge } from 'lodash'\n`
    content += `import { ApolloServer, makeExecutableSchema, gql } from 'apollo-server'\n`
    content += `import { GraphQLScalarType } from 'graphql'\n`
    content += `import GraphQLJSON from 'graphql-type-json'\n\n`
    content += `import { PubSub } from 'graphql-subscriptions'\n`

    content += `import { typeDef as User, resolvers as userResolvers } from './graphql/user'\n`
    //import all type and resolvers
    types.map((type)=>{
        content += `import { typeDef as ${type}, resolvers as ${camelize(type)}Resolvers } from './graphql/${camelize(type)}'\n`
    })

    content +=
        `const pubSub = new PubSub()\n`+ 
        `\nconst cote = require('cote')({ redis: { host: REDIS_HOST, port: REDIS_PORT } })\n`+
        "const typeDefs = gql`\n"+
        "   type Query { default: String }\n"+
        "   type Response { message: String }\n"+
        "   type Mutation { default: String }\n"+
        "   type Subscription { default: String }\n"+
        "   scalar JSON\n"+
        "   scalar Date\n`"+
        `
        const resolver = {
            JSON: GraphQLJSON,
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
        }`

    content += 
        `
        const schema = makeExecutableSchema({
            typeDefs: [ typeDefs, User, ${types.join(", ")}],
            resolvers: merge(resolver,  userResolvers, ${types.map((t)=> camelize(t)+"Resolvers({ pubSub })").join(", ")}),
        });
        `
    
    content += `
        const userRequester = new cote.Requester({ 
            name: 'User Requester', 
            key: 'user',
        })      
            ` 
    //requster
    types.map((t)=>{
        content += `
            const ${camelize(t)+"Requester"} = new cote.Requester({ 
                name: '${t} Requester', 
                key: '${camelize(t)}',
            })
        `
    })


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
                headers: !connection && parseBearerToken(req.headers),
                userRequester,
                ${types.map((e)=> camelize(e)+"Requester").join(", ")}
            }
        }\n`

    content += `
        const server = new ApolloServer({
            schema, 
            context
        })

        server.listen().then(({url})=>{
            console.log("Server ready at"+url)
        })
    `
    return beautify(content)
}

const whitelistTypes = ['DirectiveDefinition', 'ScalarTypeDefinition', 'EnumTypeDefinition']
const reservedTypes = ['User']
const generateGraphqlSchema = (schema)=>{
    let contents =  []
    let types = ["user"]
    for(let i =0; i < schema.definitions.length; i++){
        if(reservedTypes.includes(schema.definitions[i].name.value)){
            continue
        }
        if(whitelistTypes.includes(schema.definitions[i].kind)){
            continue
        }
        let typeName = pluralize.singular(schema.definitions[i].name.value)
        types.push(typeName.toLowerCase())
    }
    for(let i =0; i < schema.definitions.length; i++){
        if(reservedTypes.includes(schema.definitions[i].name.value)){
            continue
        }
        if(whitelistTypes.includes(schema.definitions[i].kind)){
            continue
        }
        let typeName = pluralize.singular(schema.definitions[i].name.value)
        let content = "export const typeDef = `\n"
        let type = `    type ${typeName} {\n`

        let relationTypes = []
        schema.definitions[i].fields.map((e)=>{
            // if(types.includes(e.name.value)){
            //     console.log(types, e.name.value, e.type.kind)
            //     relationTypes.push(e.name.value)
            // }
            //hasmany
            // if(e.type.type){
            //     console.log(e.type.type.name.value)
            // }
            if(e.type.type){
                if(types.includes(camelize(e.type.type.name.value))){
                    relationTypes.push({
                        name: e.name.value,
                        relatedTo: camelize(e.type.type.name.value),
                        type: e.type.kind
                    })

                    type += `       ${e.name.value} (query: JSON): ${fieldType(e.type)} \n`
                }else{
                    type += `       ${e.name.value}: ${fieldType(e.type)} \n`
                }
            }else{
                type += `       ${e.name.value}: ${fieldType(e.type)} \n`
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
       

        input += `    input ${typeName}Input {\n`
        schema.definitions[i].fields.map((e)=>{
            let role = []
            e.directives.map((d)=>{
                if(d.name.value == "role"){
                    d.arguments.map((args)=>{
                        if(args.name.value == "onCreate"){
                            if(args.value.value == "own"){
                                role.push(args.value.value)
                                return
                            }
                        }
                    })
                }
            })
            if(!role.includes("own") && e.type.kind !== "ListType" && e.name.value !== "_id"){
                input += `       ${field(types, e.name.value, e.type)}\n`
            }
        })
        input += "    }\n\n"
        queriesPrepend+= `\n        ${camelize(pluralize(typeName))} (query: JSON): [${typeName}]`
        queriesPrepend+= `\n        ${camelize(pluralize(typeName))}Connection (query: JSON): ${typeName}Connection`

        subscriptionPrepend+= `\n       ${camelize(typeName)}Added: ${typeName}`
        subscriptionPrepend+= `\n       ${camelize(typeName)}Updated: ${typeName}`
        subscriptionPrepend+= `\n       ${camelize(typeName)}Deleted: ${typeName}`

        mutationPrepend+= `\n       create${typeName}(input: ${typeName}Input): ${typeName}`
        mutationPrepend+= `\n       update${typeName}(input: ${typeName}Input, _id: String): ${typeName}`
        mutationPrepend+= `\n       delete${typeName}(_id: String): ${typeName}`


        const queries = queriesPrepend+queriesAppend
        const mutations = mutationPrepend+mutationAppend
        const subscriptions = subscriptionPrepend+subscriptionAppend
        let result = type+ "\n" + queries + "\n" + input + subscriptions + mutations
        content += result + "`\n"

        //resolver
        let resolvers = "export const resolvers = ({ pubSub }) => ({\n"
        let resolverQueries = "    Query: {\n"
        let resolverMutations = "    Mutation : {\n"
        let resolverSubscriptions = "    Subscription : {\n"
        let resolverRelations = ""
        let typeNames = []
        for(let i =0; i < schema.definitions.length; i++){
            if(reservedTypes.includes(schema.definitions[i].name.value)){
                continue
            }
            if(whitelistTypes.includes(schema.definitions[i].kind)){
                continue
            }
            let typeName = schema.definitions[i].name.value
            typeNames.push(typeName)
        }
        
        let requester = camelize(typeName)+"Requester"
        //findall
        resolverQueries += `${camelize(pluralize(typeName))}: async(_, { query }, { ${typeNames.map((e)=> camelize(e)+"Requester").join(", ")}, headers })=>{\n`
        resolverQueries += `    return await ${requester}.send({ type: 'index', query, headers})\n`
        resolverQueries += "}, \n"

        //connections
        resolverQueries += `${camelize(pluralize(typeName))}Connection: async(_, { query }, { ${typeNames.map((e)=> camelize(e)+"Requester").join(", ")}, headers })=>{\n`
        resolverQueries += `    return await ${requester}.send({ type: 'indexConnection', query, headers})\n`
        resolverQueries += "}, \n"
        
        if(relationTypes.length > 0){
            resolverRelations += `    ${typeName}: {\n`
 
            relationTypes.map((e)=>{
                if(e.type == "ListType"){
                    resolverRelations += `${pluralize(e.name)}: async ({ _id }, { query }, { headers, ${pluralize.singular(e.relatedTo)}Requester })=>{\n`
                    resolverRelations += `  return await ${pluralize.singular(e.relatedTo)}Requester.send({ type: 'index', query: Object.assign({ ${camelize(typeName)}Id: _id }, query), headers })\n`
                    resolverRelations += `},\n`
                }else{
                    resolverRelations += `${e.name}: async ({ ${e.name}Id }, args, { headers, ${e.relatedTo}Requester })=>{\n`
                    resolverRelations += `  return await ${e.relatedTo}Requester.send({ type: 'show', _id: ${e.name}Id, headers })\n`
                    resolverRelations += `},\n`
                }

            })
            resolverRelations += `    },\n`
        }


        resolverMutations +=`create${typeName}: async(_, { input = {} }, { ${typeNames.map((e)=> camelize(e)+"Requester").join(", ")}, headers })=>{
                                let data = await ${requester}.send({ type: 'store', body: input, headers})
                                pubSub.publish("${camelize(typeName)}Added", { ${camelize(typeName)}Added: data })
                                return data
                            },`

        resolverMutations +=`update${typeName}: async(_, { input = {} , _id }, { ${typeNames.map((e)=> camelize(e)+"Requester").join(", ")}, headers })=>{
                                let data = await ${requester}.send({ type: 'update', body: input, _id, headers})
                                pubSub.publish("${camelize(typeName)}Updated", { ${camelize(typeName)}Updated: data })
                                return data
                            },`

        resolverMutations += `delete${typeName}: async(_, { _id }, { ${typeNames.map((e)=> camelize(e)+"Requester").join(", ")}, headers })=>{
                                let data = await ${requester}.send({ type: 'destroy', _id,  headers})
                                pubSub.publish("${camelize(typeName)}Deleted", { ${camelize(typeName)}Deleted: data })
                                return data
                            },`


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

onDeleteRelations = (type, relatedTable, foreignId) =>{
    switch(type){
        case "SET_NULL":
            return `
                //onDelete
                //ON DELETE SET NULL
                await ${relatedTable}Requester.send({ type: 'update', 
                    _id: null,   
                    headers: {
                        authorization: context.params.token
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
                await ${relatedTable}Requester.send({ type: 'destroy', 
                    _id: null,   
                    headers: {
                        authorization: context.params.token
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
                    type: 'index', 
                    query: {
                        ${foreignId}Id: context.id
                    }, 
                    headers: {
                        authorization: context.params.token
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
                await ${relatedTable}Requester.send({ type: 'update', 
                    _id: null,   
                    headers: {
                        authorization: context.params.token
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
    onDeleteRelations
}