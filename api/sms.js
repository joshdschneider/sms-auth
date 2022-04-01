const express = require('express')
const router = express.Router()
const User = require('../models/user')
const config = require('../config')
const twilio = require('twilio')(config.twilio.sid, config.twilio.token)
const requestIp = require('request-ip')
const generate = require('../helpers/generators')
const password = require('../helpers/passwords')
const attempt = require('../helpers/attempts')

router.post('/signup', async (req, res) => {
  try {
    const countryCode = req.body.country_code
    const phoneNumber = req.body.phone_number

    if (!countryCode) {
      res.status(401).send('Country code is require')
      return
    }

    if (!phoneNumber) {
      res.status(401).send('Phone number is required')
      return
    }

    const user = await User.findOne({ phone_number: phoneNumber })
    const oneTimePassword = generate.otp()
    const timeNow = Date.now()

    if (user) {
      if (user.is_confirmed) {
        res.status(401).send('User already exists')
        return
      } else {
        user.auth.one_time_password = oneTimePassword
        user.auth.one_time_password_timestamp = timeNow
        await user.save()
      }
    } else {
      await User.create({
        country_code: countryCode,
        phone_number: phoneNumber,
        auth: {
          one_time_password: oneTimePassword,
          one_time_password_timestamp: timeNow,
        },
      })
    }

    await twilio.messages.create({
      body: `Wavepool one-time password: ${oneTimePassword}`,
      from: config.twilio.number,
      to: countryCode + phoneNumber,
    })

    res.status(200).send('Success')
  } catch (e) {
    console.error(e)
    res.status(500).send(e.message)
  }
})

router.post('/login', async (req, res) => {
  try {
    const countryCode = req.body.country_code
    const phoneNumber = req.body.phone_number

    if (!countryCode) {
      res.status(401).send('Country code is required')
      return
    }

    if (!phoneNumber) {
      res.status(401).send('Phone number is required')
      return
    }

    const user = await User.findOne({ phone_number: phoneNumber })

    if (!user) {
      res.status(401).send('User not found')
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

    const oneTimePassword = generate.otp()
    const timeNow = Date.now()

    user.auth.one_time_password = oneTimePassword
    user.auth.one_time_password_timestamp = timeNow

    await user.save()

    await twilio.messages.create({
      body: `Wavepool one-time password: ${oneTimePassword}`,
      from: config.twilio.number,
      to: countryCode + phoneNumber,
    })

    res.status(200).send('Success')
  } catch (e) {
    console.error(e)
    res.status(500).send('Something went wrong')
  }
})

router.post('/verify', async (req, res) => {
  try {
    const phoneNumber = req.body.phone_number
    const reqOneTimePassword = req.body.one_time_password

    if (!phoneNumber) {
      res.status(401).send('Phone number is required')
      return
    }

    if (!reqOneTimePassword) {
      res.status(401).send('One-time password is require')
      return
    }

    const ip = requestIp.getClientIp(req)
    const user = await User.findOne({ phone_number: phoneNumber })

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

    if (password.expired(user)) {
      attempt.increment(user, ip)
      res.status(401).send('Password expired')
      return
    }

    if (password.mismatch(user, reqOneTimePassword)) {
      attempt.increment(user, ip)
      res.status(401).send('Incorrect one-time password')
      return
    }

    attempt.reset(user, ip)
    attempt.confirm(user)
    const sessionToken = generate.sessionToken({ _id: user._id })
    user.auth.session_token = sessionToken
    user.auth.login_method = 'sms'
    await user.save()
    res.status(200).send(user)
  } catch (e) {
    console.error(e)
    res.status(400).send('Something went wrong')
  }
})

module.exports = router
