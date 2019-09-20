module.exports = (app) => ({
    before: {
        get: async (context) => {
            //do something before get request            
        },
        find: async (context) => {
            //do something before find request
        },
        create: async (context) => {
            //do something before create request
        },
        delete: async (context) => {
            //do something before delete request
        },
        patch: async (context) => {
            //do something before patch request
        }, 
    },
    after:{
        get: async (context) => {
            //do something after get request
        },
        find: async (context) => {
            //do something after find request
        },
        create: async (context) => {
            //do something after create request
        },        
        delete: async (context) => {
            //do something after delete request
        },
        patch: async (context) => {
            //do something after patch request
        }, 
    },
})