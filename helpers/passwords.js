function expired(user) {
  const pt = new Date(user.auth.one_time_password_timestamp)
  const sec = (Date.now() - pt) / 1000
  const exp = sec > 60 ? true : false
  return exp
}

function mismatch(user, reqOtp) {
  if (user.auth.one_time_password != reqOtp) {
    return true
  } else {
    return false
  }
}

module.exports = { expired, mismatch }
