module.exports = function(app) {
    const mongooseVirtuals = require('mongoose-lean-virtuals');
    const mongooseClient = app.get('mongooseClient');
    const model = new mongooseClient.Schema({
        name: { type: String, required: true },
        ip: { type: String, required: true },
        editor: { type: String, required: true },
        status: { type: String, required: false },
        description: { type: String, required: false },
        os: { type: String, required: false },
        usersId: { type: String, required: false },
    }, {
        timestamps: true
    })
    model.virtual('id').get(function() {
        return this._id
    })
    model.set('toObject', { virtuals: true })
    model.set('toJSON', { virtuals: true })
    model.plugin(mongooseVirtuals)
    return mongooseClient.model("servers", model)
}