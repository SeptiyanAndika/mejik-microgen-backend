// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const mongooseVirtuals = require('mongoose-lean-virtuals')
module.exports = function (app) {
    const mongooseClient = app.get('mongooseClient');
    const model = new mongooseClient.Schema({
        playerId: { type: String, required: true },
        userId: {type: String, required: true},
        segment: { type: String }
    }, {
        timestamps: true
    });
    model.virtual('id').get(function () {
        return this._id
    })
    model.set('toObject', { virtuals: true })
    model.set('toJSON', { virtuals: true })
    model.plugin(mongooseVirtuals)
    return mongooseClient.model('pushNotifications', model);
};