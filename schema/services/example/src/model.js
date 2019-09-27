// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const mongooseVirtuals = require('mongoose-lean-virtuals')
module.exports = function (app) {
    console.log("test")
    const mongooseClient = app.get('mongooseClient');
    const model = new mongooseClient.Schema({
        startTime: { type: Date },
        endTime: { type: Date },
        price: { type: Number },
        name: { type: String, required: true }

    }, {
        timestamps: true
    });
    model.virtual('id').get(function () {
        return this._id
    })
    model.set('toObject', { virtuals: true })
    model.set('toJSON', { virtuals: true })
    model.plugin(mongooseVirtuals)
    return mongooseClient.model('examples', model);
};