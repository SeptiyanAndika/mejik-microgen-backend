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
            let ticket = await app.get('ticketRequester').send({
                type: 'show',
                id: context.data.ticketId,
                headers: context.params.headers
            })

            app.service("orders").patch(context.result.id, {
                price: ticket.price,
                subTotal: ticket.price * context.data.qty + context.data.fee,
            }, {
                headers: context.params.headers,
            })

            app.get('ticketRequester').send({
                type: 'update',
                body: { qty: ticket.qty - context.data.qty },
                id: context.data.ticketId,
                headers: context.params.headers
            })
        },
        patch: async (context) => {
            //do something after patch request
        },
        delete: async (context) => {
            //do something after delete request
        }
    },
})