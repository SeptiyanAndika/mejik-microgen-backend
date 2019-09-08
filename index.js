const fs = require("fs")
const {printSchema, parse, GraphQLSchema} = require("graphql")
const { makeExecutableSchema } = require("apollo-server")
const path = require("path")
const {generateGraphqlSchema, generateGraphqlServer, generatePackageJSON, whitelistTypes} = require("./generators")
const ncp = require('ncp').ncp;
const config = JSON.parse(fs.readFileSync("./config.json").toString())
const pluralize = require('pluralize')
let type = fs.readFileSync("./schema.graphql").toString()

const { UpperCaseDirective } = require('./directives')
const scalars = require('./scalars')

let buildSchema = makeExecutableSchema({
    typeDefs: [scalars, type ],
    schemaDirectives: {
        upper: UpperCaseDirective
    },
})

const schema = parse(printSchema(buildSchema));

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
    fs.writeFile(path.join(__dirname, `${dir}${camelize(fileName)}`), file, (err) => {
        console.log('Outputs generated!');
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
        console.log('done!');
    });
    ncp(authGraphql, "./outputs/graphql/user.js", function (err) {
        if (err) {
            return console.error(err);
        }
        console.log('done!');
    })
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
                required: e.type.kind == "NamedType" ? false: true
            })
        })
        types.push({
            name: pluralize.singular(def.name.value),
            fields
        })
    })

    generateAuthentiations(types)

    let outputGraphqlServer = generateGraphqlServer(types.map((t)=> t.name))
    writeFile("./outputs/", "graphql.js", outputGraphqlServer)

    // graphql
    let outputGraphqlSchema = generateGraphqlSchema(schema)
    outputGraphqlSchema.map((s, index)=>{
        writeFile(graphqlDirectiory, `${types[index].name}.js`, s)
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
            fs.readFile(schemaExampleFeather+"index.js", (err, content)=>{
                content = content.toString()
                content = content.replace(/example/g, e.name.toLowerCase()).replace(/Example/g, e.name)
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
                        content = content.toString().replace(/example/g, e.name.toLowerCase())
                        if(fileName == "model.js"){
                            content = "module.exports = function (app) {\n"
                            content += "const mongooseClient = app.get('mongooseClient');\n"
                            content += `const model = new mongooseClient.Schema({\n`
                            //fields
                            e.fields.map((f)=>{
                                types.map((t)=>{
                                    if(t.name == f.type){
                                        content += `        ${t.name.toLowerCase()+"Id"}: { type: String, required: false },\n`
                                    }
                                })
                                if(f.name !== "_id" && f.name !== "id" && primitiveTypes.includes(f.type)){
                                    content += `        ${f.name}: { type: ${convertToFeatherTypes(f.type)}, required: ${f.required} },\n`
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
