require('dotenv').config()

const express = require('express')
const app = express()
const port = process.env.PORT || 3333
const cors = require('cors')
const helmet = require('helmet')
const config = require('./config')
const mongoose = require('mongoose')
const sms = require('./api/sms')
const anon = require('./api/anon')
const backup = require('./api/backup')
const session = require('./api/session')

app.use(express.json())
app.use(cors(config.cors))
app.use(helmet())
app.use('/sms', sms)
app.use('/anon', anon)
app.use('/backup', backup)
app.use('/session', session)

mongoose
  .connect(config.mongo.uri, config.mongo.options)
  .then(() => app.listen(port))
  .catch((e) => console.error(e))
