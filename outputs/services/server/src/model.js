module.exports = function(app) {
    const mongooseVirtuals = require('mongoose-lean-virtuals');
    const uniqueValidator = require('mongoose-unique-validator');
    const mongooseClient = app.get('mongooseClient');
    const model = new mongooseClient.Schema({
        name: { type: String, required: true, unique: false },
        ip: { type: String, required: true, unique: false },
        editor: { type: String, required: true, unique: false },
        status: { type: String, required: false, unique: false },
        description: { type: String, required: false, unique: false },
        os: { type: String, required: false, unique: false },
        usersId: { type: String, required: false },
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
    return mongooseClient.model("servers", model)
}