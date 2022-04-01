const express = require('express')
const router = express.Router()
const User = require('../models/user')
const requestIp = require('request-ip')
const generate = require('../helpers/generators')
const attempt = require('../helpers/attempts')

router.post('/login', async (req, res) => {
  try {
    const backupCode = req.body.backup_code
    const ip = requestIp.getClientIp(req)

    if (!backupCode) {
      res.status(401).send('Backup code is required')
      return
    }

    const user = await User.findOne({ backup_code: backupCode })

    if (!user) {
      res.status(401).send('Invalid backup code')
      return
    }

    if (user.auth.is_locked) {
      const lockedAt = new Date(user.auth.last_locked_timestamp)
      const lockedSeconds = (Date.now() - lockedAt) / 1000

      if (lockedSeconds > 60) {
        attempt.unlock(user._id)
      } else {
        res.status(401).send('Please try again later')
        return
      }
    }

    attempt.reset(user, ip)
    const sessionToken = generate.sessionToken({ _id: user._id })
    user.auth.session_token = sessionToken
    await user.save()
    res.status(200).send(user)
  } catch (e) {
    console.error(e)
    res.status(400).send('Something went wrong')
  }
})

module.exports = router
