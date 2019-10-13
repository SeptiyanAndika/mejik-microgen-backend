module.exports = function(app) {
    const mongooseVirtuals = require('mongoose-lean-virtuals');
    const uniqueValidator = require('mongoose-unique-validator');
    const mongooseClient = app.get('mongooseClient');
    const model = new mongooseClient.Schema({
        serverId: { type: String, required: true },
        workspaceId: { type: String, required: true },
        name: { type: String, required: true, unique: false },
        path: { type: String, required: true, unique: false },
        status: { type: String, required: false, unique: false },
        lastOpened: { type: String, required: false, unique: false },
        countVisited: { type: Number, required: false, unique: false },
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
    return mongooseClient.model("projects", model)
}