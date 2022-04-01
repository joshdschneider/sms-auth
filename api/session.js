const express = require('express')
const router = express.Router()
const User = require('../models/user')
const { sessionToken } = require('../helpers/sessions')

router.post('/refresh', sessionToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      res.status(401).send('Unauthorized')
    } else {
      res.status(200).send(user)
    }
  } catch (e) {
    console.error(e)
    res.status(500).send(e.message)
  }
})

router.post('/logout', sessionToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      res.status(401).send('Unauthorized')
    } else {
      user.auth.session_token = null
      await user.save()
      res.status(200).send('Success')
    }
  } catch (e) {
    console.error(e)
    res.status(500).send(e.message)
  }
})

module.exports = router
