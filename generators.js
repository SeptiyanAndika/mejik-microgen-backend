const fs = require("fs")
const pluralize = require('pluralize')
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
    if(types.includes(name)){
        fieldName =  name.toLowerCase()+"Id"
        fieldType = "String"
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
        packageJSON["scripts"][`${type.toLowerCase()}-services`] = "cd "+config.services.src+type.toLowerCase()+ " && nodemon index.js"
    })

    packageJSON["scripts"]["dev"] = `npm-run-all --parallel graphql user-services ${types.map((type)=> `${type.toLowerCase()}-services`).join(" ")}`

    fs.writeFileSync(config.src+"package.json", JSON.stringify(packageJSON,null,4))
}

const generateGraphqlServer = (types) =>{
    let content = ""
    content += `import { merge } from 'lodash'\n`
    content += `import { ApolloServer, makeExecutableSchema, gql } from 'apollo-server'\n`
    content += `import { GraphQLScalarType } from 'graphql'\n`
    content += `import GraphQLJSON from 'graphql-type-json'\n\n`

    content += `import { typeDef as User, resolvers as userResolvers } from './graphql/user'\n`
    //import all type and resolvers
    types.map((type)=>{
        content += `import { typeDef as ${type}, resolvers as ${type.toLowerCase()}Resolvers } from './graphql/${type.toLowerCase()}'\n`
    })

    content += 
    `\nconst cote = require('cote')({ redis: { host: "${config.cote.redis.host}", port: ${config.cote.redis.port} } })\n`+
    "const typeDefs = gql`\n"+
    "   type Query { anything: String }\n"+
    "   type Mutation { anything: String }\n"+
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
    resolvers: merge(resolver,  userResolvers, ${types.map((t)=> t.toLowerCase()+"Resolvers").join(", ")}),
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
const ${t.toLowerCase()+"Requester"} = new cote.Requester({ 
    name: '${t} Requester', 
    key: '${t.toLowerCase()}',
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
const context = ({req}) => {
    return {
        headers: parseBearerToken(req.headers),
        userRequester,
        ${types.map((e)=> e.toLowerCase()+"Requester").join(", ")}
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
    return content
}

const whitelistTypes = ['DirectiveDefinition', 'ScalarTypeDefinition', 'EnumTypeDefinition']
const generateGraphqlSchema = (schema)=>{
    let contents =  []
    let types = []
    for(let i =0; i < schema.definitions.length; i++){
        if(whitelistTypes.includes(schema.definitions[i].kind)){
            continue
        }
        let typeName = pluralize.singular(schema.definitions[i].name.value)
        types.push(typeName.toLowerCase())
    }
    for(let i =0; i < schema.definitions.length; i++){
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
            if(types.includes(pluralize.singular(e.name.value))){
                relationTypes.push({
                    name: e.name.value,
                    type: e.type.kind
                })

                type += `       ${e.name.value} (query: JSON): ${fieldType(e.type)} \n`
            }else{
                type += `       ${e.name.value}: ${fieldType(e.type)} \n`
            }

        })
        type += "    }\n"
        let queriesPrepend = "    extend type Query {"
        let queriesAppend = "\n    } \n"

        let input = ""

        let mutationPrepend = "    extend type Mutation {"
        let mutationAppend = "\n    }\n"


        input += `    input ${typeName}Input {\n`
        schema.definitions[i].fields.map((e)=>{
            if(e.type.kind !== "ListType"){
                input += `       ${field(types, e.name.value, e.type)}\n`
            }
        })
        input += "    }\n\n"
        queriesPrepend+= `\n        ${pluralize(typeName.toLowerCase())} (query: JSON): [${typeName}]`
        mutationPrepend+= `\n       create${typeName}(input: ${typeName}Input): ${typeName}`
        mutationPrepend+= `\n       update${typeName}(input: ${typeName}Input, _id: String): ${typeName}`
        mutationPrepend+= `\n       delete${typeName}(_id: String): ${typeName}`

        const queries = queriesPrepend+queriesAppend
        const mutations = mutationPrepend+mutationAppend
        let result = type+ "\n" + queries + "\n" + input + mutations
        content += result + "`\n"

        //resolver
        let resolvers = "export const resolvers = {\n"
        let resolverQueries = "    Query: {\n"
        let resolverMutations = "    Mutation : {\n"
        let resolverRelations = ""
        let typeNames = []
        for(let i =0; i < schema.definitions.length; i++){
            if(whitelistTypes.includes(schema.definitions[i].kind)){
                continue
            }
            let typeName = schema.definitions[i].name.value
            typeNames.push(typeName)
        }
        
        let requester = typeName.toLowerCase()+"Requester"
        //findall
        resolverQueries += `        ${pluralize(typeName.toLowerCase())}: async(_, { query }, { ${typeNames.map((e)=> e.toLowerCase()+"Requester").join(", ")}, headers })=>{\n`
        resolverQueries += `            return await ${requester}.send({ type: 'index', query, headers})\n`
        resolverQueries += "        }, \n"
        if(relationTypes.length > 0){
            resolverRelations += `    ${typeName}: {\n`
 
            relationTypes.map((e)=>{
                if(e.type == "ListType"){
                    resolverRelations += `        ${pluralize(e.name)}: async ({ _id }, { query }, { headers, ${pluralize.singular(e.name)}Requester })=>{\n`
                    resolverRelations += `            return await ${pluralize.singular(e.name)}Requester.send({ type: 'index', query: Object.assign({ ${typeName.toLowerCase()}Id: _id }, query), headers })\n`
                    resolverRelations += `        },\n`
                }else{
                    resolverRelations += `        ${e.name}: async ({ ${e.name}Id }, args, { headers, ${e.name}Requester })=>{\n`
                    resolverRelations += `            return await ${e.name}Requester.send({ type: 'show', _id: ${e.name}Id, headers })\n`
                    resolverRelations += `        },\n`
                }

            })
            resolverRelations += `    },\n`
        }


  


        resolverMutations += `       create${typeName}: async(_, { input }, { ${typeNames.map((e)=> e.toLowerCase()+"Requester").join(", ")}, headers })=>{\n`
        resolverMutations += `           return await ${requester}.send({ type: 'store', body: input, headers})\n`
        resolverMutations += "       }, \n"

        resolverMutations += `       update${typeName}: async(_, { input, _id }, { ${typeNames.map((e)=> e.toLowerCase()+"Requester").join(", ")}, headers })=>{\n`
        resolverMutations += `           return await ${requester}.send({ type: 'update', body: input, _id, headers})\n`
        resolverMutations += "       }, \n"

        resolverMutations += `       delete${typeName}: async(_, { _id }, { ${typeNames.map((e)=> e.toLowerCase()+"Requester").join(", ")}, headers })=>{\n`
        resolverMutations += `           return await ${requester}.send({ type: 'destroy', _id,  headers})\n`
        resolverMutations += "       }, \n"


        resolverQueries += "    }, \n"
        resolverMutations += "   }, \n"
        //end of queries
        resolvers += resolverQueries + resolverRelations + resolverMutations + "}"
        content += resolvers

        contents.push(content)
    }
    return contents
}

onDeleteRelations = (type, relatedTable) =>{
    switch(type){
        case "SET_NULL":
            return `
                await ${relatedTable}Requester.send({ type: 'update', 
                    _id: null,   
                    headers: {
                        authorization: context.params.token
                    }, 
                    body: {
                        classId: null
                    },
                    params: {
                        query: {
                            classId: context.id
                        }
                    }
                })`
        case "CASCADE":
            return `
                await ${relatedTable}Requester.send({ type: 'destroy', 
                    _id: null,   
                    headers: {
                        authorization: context.params.token
                    }, 
                    params: {
                        query: {
                            classId: context.id
                        }
                    }
                })`
        case "RESTRICT":
            return `
                let belongsTo = await ${relatedTable}Requester.send({ 
                    type: 'index', 
                    query: {
                        classId: context.id
                    }, 
                    headers: {
                        authorization: context.params.token
                    }
                })
                if(belongsTo.length > 0){
                    throw Error("Failed delete", null)
                }
            `
        default:
            return `
                await ${relatedTable}Requester.send({ type: 'update', 
                    _id: null,   
                    headers: {
                        authorization: context.params.token
                    }, 
                    body: {
                        classId: null
                    },
                    params: {
                        query: {
                            classId: context.id
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
    onDeleteRelations
}