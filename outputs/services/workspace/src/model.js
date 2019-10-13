module.exports = function(app) {
    const mongooseVirtuals = require('mongoose-lean-virtuals');
    const uniqueValidator = require('mongoose-unique-validator');
    const mongooseClient = app.get('mongooseClient');
    const model = new mongooseClient.Schema({
        name: { type: String, required: true, unique: false },
        userId: { type: String, required: true },
        createdBy: String,
        updatedBy: String
    }, {
        timestamps: true
    })
    model.virtual('id').get(function() {
        return this._id
    })
    model.set('toObject', { virtuals: true })
    model.set('toJSON', { virtuals: true })
    model.plugin(mongooseVirtuals)
    model.plugin(uniqueValidator)
    return mongooseClient.model("workspaces", model)
}