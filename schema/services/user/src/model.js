module.exports = function (app) {
    const mongooseClient = app.get('mongooseClient');
    const users = new mongooseClient.Schema({
        email: {type: String, unique: true, lowercase: true},
        password: { type: String },
        firstName: { type: String },
        lastName: { type: String },
        role: {type: String}
    }, {
        timestamps: true
    });
    
    return mongooseClient.model('users', users);
}
    