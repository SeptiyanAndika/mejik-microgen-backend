const { HOST, MONGODB, PORT, AUTHENTICATION } = require("../config")

const express = require('@feathersjs/express')
const feathers = require('@feathersjs/feathers')
const service = require('feathers-mongoose')
const app = express(feathers())


const mongoose = require('./mongoose');
const { User, ForgetPassword } = require('./models')
const hooks = require('./hooks');
const authentication = require('./authentication');

app.set("host", HOST)
app.set("port", PORT)
app.set("mongodb", MONGODB)
app.set('authentication', AUTHENTICATION)

// Turn on JSON parser for REST services
app.use(express.json())
// Turn on URL-encoded parser for REST services
app.use(express.urlencoded({ extended: true }));
// Set up REST transport
app.configure(express.rest())

app.configure(authentication);
app.configure(mongoose)

app.use('/users', service({Model: User(app), whitelist: [ '$regex', '$options' ], multi: ['patch']}))
app.use('/forgetPasswords', service({Model: ForgetPassword(app), whitelist: [ '$regex', '$options' ]}))
app.service('users').hooks(hooks)
module.exports = app