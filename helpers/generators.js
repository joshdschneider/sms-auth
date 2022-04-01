const jwt = require('jsonwebtoken')
const crypto = require('crypto')

function otp() {
  return crypto.randomInt(0, 1000000).toString().padStart(6, '0')
}

function bytes(count) {
  return crypto.randomBytes(count).toString('hex')
}

function sessionToken(user) {
  return jwt.sign(user, process.env.SESSION_TOKEN_SECRET)
}

module.exports = { otp, bytes, sessionToken }
