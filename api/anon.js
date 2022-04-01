const express = require('express')
const router = express.Router()
const User = require('../models/user')
const requestIp = require('request-ip')
const generate = require('../helpers/generators')
const attempt = require('../helpers/attempts')

router.post('/signup', async (req, res) => {
  try {
    const ip = requestIp.getClientIp(req)
    const anon_id = generate.bytes(64)
    const user = await User.create({ anon_id })
    attempt.reset(user, ip)
    const sessionToken = generate.sessionToken({ _id: user._id })
    user.auth.session_token = sessionToken
    user.auth.login_method = 'anon'
    await user.save()
    res.status(200).send(user)
  } catch (e) {
    console.error(e)
    res.status(500).send(e.message)
  }
})

router.post('/login', async (req, res) => {
  try {
    const ip = requestIp.getClientIp(req)
    const anon_id = req.body.anon_id
    const user = await User.findOne({ anon_id })

    if (!user) {
      res.status(401).send('User not found')
      return
    }

    attempt.reset(user, ip)
    const sessionToken = generate.sessionToken({ _id: user._id })
    user.auth.session_token = sessionToken
    user.auth.login_method = 'anon'
    await user.save()
    res.status(200).send(user)
  } catch (e) {
    console.error(e)
    res.status(500).send(e.message)
  }
})

module.exports = router
