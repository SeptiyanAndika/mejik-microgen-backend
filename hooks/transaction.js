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
            let orders = await app.get('orderRequester').send({
                type: 'index',
                query: {
                    transactionId: context.id
                },
                headers: context.params.headers
            })

            let total = 0
            orders.map(order => {
                total += order.subtotal
            })

            app.service("transactions").patch(context.id, {
                total
            }, {
                headers: context.params.headers,
            })
        },
        delete: async (context) => {
            //do something after delete request
        }
    },
})