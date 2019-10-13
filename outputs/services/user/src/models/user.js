module.exports = function(app) {
    const mongooseVirtuals = require('mongoose-lean-virtuals');
    const uniqueValidator = require('mongoose-unique-validator');
    const mongooseClient = app.get('mongooseClient');
    const model = new mongooseClient.Schema({
        email: { type: String, unique: true, lowercase: true },
        password: { type: String },
        firstName: { type: String },
        role: { type: String },
        lastName: { type: String },
        createdBy: { type: String },
        updatedBy: { type: String },
        status: { type: String, required: false, unique: false },
        createdBy: { type: String, required: false, unique: false },
        updatedBy: { type: String, required: false, unique: false },
        createdAt: { type: Date, required: false, unique: false },
        updatedAt: { type: Date, required: false, unique: false },
        phoneNumbers: { type: String, required: false, unique: false },
        image: { type: String, required: false, unique: false },
        serversId: { type: String, required: false },
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
    return mongooseClient.model("users", model)
}