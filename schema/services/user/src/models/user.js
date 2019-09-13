module.exports = function(app) {
    const mongooseClient = app.get('mongooseClient');
    const model = new mongooseClient.Schema({
        email: { type: String, unique: true, lowercase: true },
        password: { type: String },
        firstName: { type: String },
        lastName: { type: String },
        role: { type: String },
        phoneNumbers: { type: String, required: false },
    }, {
        timestamps: true
    })
    return mongooseClient.model("users", model)
}