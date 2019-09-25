const mongoose = require('mongoose')

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
            let checkTransaction = await app.get('transactionRequester').send({
                type: 'index',
                query: {
                    isPaid: null
                },
                headers: context.params.headers
            })

            let transaction = null
            if (checkTransaction.length === 0) {
                transaction = await app.get('transactionRequester').send({
                    type: 'store',
                    body: {
                        _id: mongoose.Types.ObjectId()
                    },
                    headers: context.params.headers
                })
            } else {
                transaction = checkTransaction
            }

            let ticket = await app.get('ticketRequester').send({
                type: 'show',
                id: context.data.ticketId,
                headers: context.params.headers
            })

            context.data.transactionId = transaction[0].id
            context.data.price = ticket.price
            context.data.subTotal = ticket.price * context.data.qty + context.data.fee

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
            let token = context.params.headers.authorization
            let auth = await app.get('userRequester').send({ type: 'verifyToken', token })
            let order = context.result.data.filter(data => data.userId.toString() === auth.user.id.toString())

            context.result.total = order.length
            context.result.data = order

            return context
        },
        get: async (context) => {
            //do something after get request
        },
        create: async (context) => {
            //do something after create request
            let ticket = await app.get('ticketRequester').send({
                type: 'show',
                id: context.result.ticketId,
                headers: context.params.headers
            })

            app.get('ticketRequester').send({
                type: 'update',
                body: { qty: ticket.qty - context.result.qty },
                id: context.result.ticketId,
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