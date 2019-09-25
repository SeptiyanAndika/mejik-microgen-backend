module.exports = (app) => ({
    before: {
        find: async (context) => {
            //do something before find request
        },
        get: async (context) => {
            //do something before get request            
        },
        create: async (context) => {
            //do something before create request
            context.data.stock = context.data.qty
            return context
        },
        patch: async (context) => {
            //do something before patch request
        },
        delete: async (context) => {
            //do something before delete request
        },
    },
    after: {
        find: async (context) => {
            //do something after find request
        },
        get: async (context) => {
            //do something after get request
        },
        create: async (context) => {
            //do something after create request
        },
        patch: async (context) => {
            //do something after patch request
        },
        delete: async (context) => {
            //do something after delete request
        }
    },
})