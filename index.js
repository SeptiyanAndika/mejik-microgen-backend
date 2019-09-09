const fs = require("fs")
const {printSchema, parse, GraphQLSchema} = require("graphql")
const merge = require("lodash").merge
const { makeExecutableSchema } = require("graphql-tools")
const path = require("path")
const {generateGraphqlSchema, generateGraphqlServer, generatePackageJSON, whitelistTypes, onDeleteRelations} = require("./generators")
const ncp = require('ncp').ncp;
const config = JSON.parse(fs.readFileSync("./config.json").toString())
const pluralize = require('pluralize')
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
const schema = parse(rawSchema);

const graphqlDirectiory = './outputs/graphql/';
const featherDirectory = './outputs/services/';

let defaultConfigService = { 
    host: 'localhost',
    port: 3031,
    paginate: { default: 10, max: 50 },
    mongodb: 'mongodb://localhost:27017/' 
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

function camelize(text) {
    return text.replace(/^([A-Z])|[\s-_]+(\w)/g, function(match, p1, p2, offset) {
        if (p2) return p2.toUpperCase();
        return p1.toLowerCase();        
    });
}

function generateAuthentiations(types){
    const authServices = "./schema/services/user"
    const authGraphql =  "./schema/graphql/user.js"
    ncp(authServices, "./outputs/services/user", function (err) {
        if (err) {
            return console.error(err);
        }


        let actions = ['find', 'get', 'create', 'update', 'remove', 'patch']

        const permissions =
`const permissions = {
    admin: ['admin:*'],
    authenticated: [
        ${types.map((t)=>{
            return actions.map((a)=>{
                return `'${t.name.toLowerCase()}:${a}'`
            }).join(", ")
        })}
    ],
    public: [
        ${types.map((t)=>{
            return actions.filter((a)=> a == "find" || a == "get" ).map((a)=>{
                return `'${t.name.toLowerCase()}:${a}'`
            }).join(", ")
        })}
    ],
}
module.exports = {
    permissions
}
        `
        // //generate permissions
        fs.writeFileSync("./outputs/services/user/src/permissions.js", permissions)
    });
    ncp(authGraphql, "./outputs/graphql/user.js", function (err) {
        if (err) {
            return console.error(err);
        }
    })
}

function addNewRequester(content, type, requesterName, requesters){
    if(requesters.includes(requesterName)){
        return content
    }
    requesters.push(requesterName)
    let contentSplitResponser = content.split(`${type.toLowerCase()}Service.on`)
    let addNewRequester = 
`const ${pluralize.singular(requesterName.toLowerCase())}Requester = new cote.Requester({
    name: '${pluralize.singular(requesterName)} Requester',
    key: '${pluralize.singular(requesterName.toLowerCase())}',
})\n
`
    contentSplitResponser[0] += addNewRequester
    content = contentSplitResponser.join(`${type.toLowerCase()}Service.on`)
    return content
}
async function main(){
    if(!fs.existsSync("./outputs")){
        fs.mkdirSync("./outputs")
    }

    //copy readme.me
    ncp("./schema/README.md", "./outputs/README.md")
    let types = []
    schema.definitions.filter((def)=> !whitelistTypes.includes(def.kind)).map((def)=>{
        fields = []

        def.fields.map((e)=>{
            fields.push({
                name: e.name.value,
                type: e.type.kind == "NamedType" ? e.type.name.value : e.type.type.name.value,
                required: e.type.kind == "NonNullType" ? true : false,
                directives: e.directives
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
        const path = featherDirectory+e.name.toLowerCase()+"/"
        if(!fs.existsSync(path)){
            fs.mkdirSync(path)
        }


        const schemaExampleFeather = "./schema/services/example/"
        fs.readdir(schemaExampleFeather, function(err, fileName){
            const configPath = schemaExampleFeather+"config/"
            fs.readdir(configPath, (err, file)=>{
                fs.readFile(configPath+file, 'utf-8', (err,content)=>{
                    const config = JSON.parse(content)
                    config.port = defaultConfigService.port+index
                    config.host = defaultConfigService.host
                    config.mongodb = defaultConfigService.mongodb+e.name.toLowerCase()+"_service"
                    if(!fs.existsSync(path+"config/")){
                        fs.mkdirSync(path+"config/")
                    }
                    fs.writeFileSync(path+"config/default.json", JSON.stringify(config, null, 4)) 
                })
            })
            let requesters = []
            fs.readFile(schemaExampleFeather+"index.js", (err, content)=>{
                content = content.toString()
                content = content.replace(/examples/g, pluralize(e.name.toLowerCase()))
                            .replace(/example/g, e.name.toLowerCase())
                            .replace(/Example/g, e.name)

                           
                e.fields.map((f)=>{
                    //find related field
                    types.map((t)=>{
                        if(pluralize.isSingular(f.name) && f.type == t.name){
                            let contentSplit = content.split("//beforeCreate")
                            let beforeCreate = 
                `
                if(context.data && context.data.${pluralize.singular(t.name.toLowerCase())}Id){
                    let belongsTo = await ${pluralize.singular(t.name.toLowerCase())}Requester.send({ 
                        type: "show", 
                        _id: context.data.${pluralize.singular(t.name.toLowerCase())}Id, 
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
                            let onDelete = onDeleteRelations(directiveRelationOnDelete, pluralize.singular(f.name.toLowerCase()))
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
                fs.writeFileSync(path+"index.js", content) 
            })

            const srcPath = schemaExampleFeather+"src/"
            //read src
            fs.readdir(srcPath, (err, file)=>{
                if(!fs.existsSync(path+"src/")){
                    fs.mkdirSync(path+"src/")
                }

                file.map((fileName)=>{
                    fs.readFile(srcPath+fileName, (err, content)=>{
                        content = content.toString().replace(/examples/g, pluralize(e.name.toLowerCase()))
                            .replace(/example/g, e.name.toLowerCase())
                            .replace(/Example/g, e.name)
                            
                        if(fileName == "model.js"){
                            content = "module.exports = function (app) {\n"
                            content += "const mongooseClient = app.get('mongooseClient');\n"
                            content += `const model = new mongooseClient.Schema({\n`
                            //fields
                            e.fields.map((f)=>{
                                types.map((t)=>{
                                    if(t.name == f.type){
                                        content += `        ${t.name.toLowerCase()+"Id"}: { type: String, required: ${f.required} },\n`
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
                                        content += `        ${f.name}: { type: ${convertToFeatherTypes(f.type)}, required: ${f.required}, default: "${defaultValue}" },\n`
                                    }else{
                                        content += `        ${f.name}: { type: ${convertToFeatherTypes(f.type)}, required: ${f.required} },\n`
                                    }

                                }
                            })
                            content += "    },{\n"
                            content += "        timestamps: true\n"
                            content += "    })\n"
                            content += `        return mongooseClient.model("${pluralize(e.name.toLowerCase())}", model)\n`
                            content += "    }"
                        }
                        // console.log(content)
                        fs.writeFileSync(path+"src/"+fileName, content)
                    })
                })
            })
        })
        //end of feathers
    })
}
main()
