const cors = {
  origin: process.env.AUTH_SERVER_CORS_ORIGIN,
  credentials: true,
}

const mongo = {
  uri: process.env.MONGODB_URI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
}

const twilio = {
  sid: process.env.TWILIO_ACCOUNT_SID,
  token: process.env.TWILIO_AUTH_TOKEN,
  number: '+18557501256',
}

module.exports = { mongo, cors, twilio }
