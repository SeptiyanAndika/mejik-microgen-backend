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

const generateGraphqlSchema = (schema)=>{
    let contents =  []
    let types = []

    for(let i =0; i < schema.definitions.length; i++){
        let typeName = schema.definitions[i].name.value
        types.push(typeName.toLowerCase())
    }
    for(let i =0; i < schema.definitions.length; i++){
        let typeName = schema.definitions[i].name.value

        let content = "export const typeDef = `\n"
        let type = `    type ${typeName} {\n`

        let relationTypes = []
        schema.definitions[i].fields.map((e)=>{
            if(types.includes(e.name.value)){
                relationTypes.push(e.name.value)
            }
            type += `       ${e.name.value}: ${fieldType(e.type)} \n`
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
        queriesPrepend+= `\n        ${typeName.toLowerCase() + "s"} (query: JSON): [${typeName}]`
        mutationPrepend+= `\n       create${typeName}(input: ${typeName}Input): ${typeName}`
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
            let typeName = schema.definitions[i].name.value
            typeNames.push(typeName)
        }

        let requester = typeName.toLowerCase()+"Requester"
        //findall
        resolverQueries += `        ${typeName.toLowerCase()+"s"}: async(_, { query }, { ${typeNames.map((e)=> e.toLowerCase()+"Requester").join(", ")}, headers })=>{\n`
        resolverQueries += `            return await ${requester}.send({ type: 'index', query, headers})\n`
        resolverQueries += "        }, \n"

        if(relationTypes.length > 0){
            resolverRelations += `    ${typeName}: {\n`
            relationTypes.map((e)=>{
                resolverRelations += `        ${e}: async ({ ${e}Id }, args, { headers, ${e}Requester })=>{\n`
                resolverRelations += `            return await ${e}Requester.send({ type: 'show', _id: ${e}Id })\n`
                resolverRelations += `        },\n`
            })
            resolverRelations += `    },\n`
        }

        resolverMutations += `       create${typeName}: async(_, { input }, { ${typeNames.map((e)=> e.toLowerCase()+"Requester").join(", ")}, headers })=>{\n`
        resolverMutations += `           return await ${requester}.send({ type: 'store', body: input, query, headers})\n`
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

module.exports = {
    generateGraphqlSchema
}