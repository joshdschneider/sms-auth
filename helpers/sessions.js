const jwt = require('jsonwebtoken')

function sessionToken(req, res, next) {
  const header = req.headers['authorization']
  const token = header ? header.split(' ')[1] : null
  const secret = process.env.SESSION_TOKEN_SECRET

  if (!token) {
    res.status(401).send('Unauthorized')
  } else {
    jwt.verify(token, secret, (err, user) => {
      if (err) {
        res.status(403).send('Something went wrong')
      } else {
        req.user = user
        next()
      }
    })
  }
}

module.exports = { sessionToken }
