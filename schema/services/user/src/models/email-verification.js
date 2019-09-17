const mongooseVirtuals = require('mongoose-lean-virtuals')
module.exports = function (app) {
    const mongooseClient = app.get('mongooseClient');
    const model = new mongooseClient.Schema({
        email: { type: String, required: true },
        token: { type: String, required: true },
    }, {
        timestamps: true
    })
    model.virtual('id').get(function () {
        return this._id
    })
    model.set('toObject', { virtuals: true })
    model.set('toJSON', { virtuals: true })
    model.plugin(mongooseVirtuals)
    return mongooseClient.model("emailVerifications", model)
}