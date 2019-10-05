module.exports = function(app) {
    const mongooseVirtuals = require('mongoose-lean-virtuals');
    const mongooseClient = app.get('mongooseClient');
    const model = new mongooseClient.Schema({
        serverId: { type: String, required: true },
        workspaceId: { type: String, required: true },
        name: { type: String, required: true },
        path: { type: String, required: true },
        status: { type: String, required: false },
        lastOpened: { type: String, required: false },
        countVisited: { type: Number, required: false },
        userId: { type: String, required: true },
    }, {
        timestamps: true
    })
    model.virtual('id').get(function() {
        return this._id
    })
    model.set('toObject', { virtuals: true })
    model.set('toJSON', { virtuals: true })
    model.plugin(mongooseVirtuals)
    return mongooseClient.model("projects", model)
}