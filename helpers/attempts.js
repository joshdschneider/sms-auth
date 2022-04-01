const User = require('../models/user')
const generate = require('./generators')

async function lock(user_id, ip) {
  const user = await User.findById(user_id)
  user.auth.is_locked = true
  user.auth.last_locked_ip = ip
  user.auth.last_locked_timestamp = Date.now()
  user.auth.attempt_count = 0
  user.auth.last_attempt_ip = ip
  user.auth.last_attempt_timestamp = 0
  await user.save()
}

async function unlock(user_id) {
  const user = await User.findById(user_id)
  user.auth.is_locked = false
  await user.save()
}

async function increment(u, ip) {
  const count = u.auth.attempt_count || 0
  const last = new Date(u.auth.last_attempt_timestamp)
  const sec = (Date.now() - last) / 1000

  if (count >= 3 && sec < 60) {
    lock(u._id, ip)
  } else {
    const user = await User.findById(u._id)
    user.auth.attempt_count = user.auth.attempt_count + 1 || 1
    user.auth.last_attempt_ip = ip
    user.auth.last_attempt_timestamp = Date.now()
    await user.save()
  }
}

async function reset(u, ip) {
  const user = await User.findById(u._id)
  user.auth.session_count = user.auth.session_count + 1 || 1
  user.auth.last_session_ip = ip
  user.auth.last_session_timestamp = Date.now()
  user.auth.attempt_count = 0
  user.auth.last_attempt_timestamp = 0
  user.auth.one_time_password = ''
  user.auth.one_time_password_timestamp = 0
  await user.save()
}

async function confirm(u) {
  if (u.is_confirmed) {
    return
  } else {
    const user = await User.findById(u._id)
    const backupCode = generate.bytes(16)
    user.is_confirmed = true
    user.backup_code = backupCode
    await user.save()
  }
}

module.exports = { lock, unlock, increment, reset, confirm }
