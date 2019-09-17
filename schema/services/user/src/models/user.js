module.exports = function (app) {
    const mongooseVirtuals = require('mongoose-lean-virtuals')
    const mongooseClient = app.get('mongooseClient');
    const model = new mongooseClient.Schema({
        email: { type: String, unique: true, lowercase: true },
        status: { type: String, required: true, default: 0 },
        password: { type: String },
        firstName: { type: String },
        lastName: { type: String },
        role: { type: String },
        phoneNumbers: { type: String, required: false },
    }, {
        timestamps: true
    })
    model.virtual('id').get(function () {
        return this._id
    })
    model.set('toObject', { virtuals: true })
    model.set('toJSON', { virtuals: true })
    model.plugin(mongooseVirtuals)
    return mongooseClient.model("users", model)
}