const { parse, print, GraphQLDirective} = require("graphql")
const fs = require('fs')
const appRoot = require('app-root-path')

///function for customize graphql
const injectConfigFromHook = (hook, schema) =>{
    const root = appRoot.toString().split('/')
    root.pop()
    const path = root.join('/') + '/hooks/' + hook + '.js'

    if(fs.existsSync(path)){
        hook = require(path)
        if(hook().config){
            Object.keys(hook().config).map((method)=>{
                if(hook().config[method].rateLimit){
                    let newSchema = addRateLimit(method, hook().config[method].rateLimit, schema)
                    schema = newSchema
                }
            })
        }
    }

    return schema
}

const addRateLimit = (method, options, schema) =>{
    // console.log("before", parse(schema))
    let parseSchema = parse(schema)
    let newDefinitions = parseSchema.definitions.map((def)=>{
            if(def.name.value == "Mutation"){
                def.fields.map((f)=>{
                    // console.log(f)
                    if(f.name.value == method){
                        f.directives.push({
                            kind: "Directive",
                            name: {
                                kind: "Name",
                                value: 'rateLimit'
                            },
                            arguments: [{
                                kind: "Argument",
                                name: {
                                    kind: "Name",
                                    value: "limit"
                                },
                                value:{
                                    kind: "IntValue",
                                    value: options.limit
                                }
                            },{
                                kind: "Argument",
                                name: {
                                    kind: "Name",
                                    value: "duration"
                                },
                                value:{
                                    kind: "IntValue",
                                    value: options.duration
                                }
                            }]
                        })
                    }
                })
            }
        
    })

    console.log("afterr", print(parseSchema))
    return print(parseSchema)

}

module.exports ={
    injectConfigFromHook
}