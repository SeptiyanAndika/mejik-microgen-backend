const { HOST, MONGODB, PORT } = require("../config")
const express = require('@feathersjs/express')
const feathers = require('@feathersjs/feathers')
const service = require('feathers-mongoose')
const app = express(feathers())

app.set("host", HOST)
app.set("port", PORT)
app.set("mongodb", MONGODB)

const mongoose = require('./mongoose');
const Model = require('./model')


// Turn on JSON parser for REST services
app.use(express.json())
// Turn on URL-encoded parser for REST services
app.use(express.urlencoded({ extended: true }));
// Set up REST transport
app.configure(express.rest())

app.configure(mongoose)
app.use('/examples', service({Model: Model(app), whitelist: [ '$regex', '$options' ], multi: ['upadate','patch', 'remove']}))

module.exports = app