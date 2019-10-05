const mongoose = require('mongoose');

module.exports = function(app) {
    mongoose.connect(
        app.get('mongodb'), { useCreateIndex: true, useNewUrlParser: true }
    ).catch(err => {
        console.log("error", err)
        process.exit(1);
    });

    mongoose.Promise = global.Promise;

    app.set('mongooseClient', mongoose);
};