// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
    console.log("test")
    const mongooseClient = app.get('mongooseClient');
    const examples = new mongooseClient.Schema({
        startTime: { type: Date },
        endTime: { type: Date },
        price: { type: Number },
        name: { type: String, required: true }
    
    }, {
        timestamps: true
    });
    return mongooseClient.model('examples', examples);
};