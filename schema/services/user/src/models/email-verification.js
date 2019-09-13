module.exports = function(app) {
    const mongooseClient = app.get('mongooseClient');
    const model = new mongooseClient.Schema({
        email: { type: String, required: true },
        token: { type: String, required: true },
    }, {
        timestamps: true
    })
    return mongooseClient.model("emailVerifications", model)
}