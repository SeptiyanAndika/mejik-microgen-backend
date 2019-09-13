module.exports = function(app) {
    const mongooseClient = app.get('mongooseClient');
    const model = new mongooseClient.Schema({
        email: { type: String, required: true },
        hash: { type: String, required: true },
    }, {
        timestamps: true
    })
    return mongooseClient.model("forgetPasswords", model)
}