const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    anon_id: {
      type: String,
      index: { unique: true, sparse: true },
    },
    phone_number: {
      type: String,
      index: { unique: true, sparse: true },
    },
    country_code: {
      type: String,
    },
    name: {
      type: String,
    },
    backup_code: {
      type: String,
    },
    is_confirmed: {
      type: Boolean,
      default: false,
    },
    auth: {
      login_method: {
        type: String,
      },
      one_time_password: {
        type: String,
      },
      one_time_password_timestamp: {
        type: Number,
      },
      session_token: {
        type: String,
      },
      session_count: {
        type: Number,
      },
      last_session_ip: {
        type: String,
      },
      last_session_timestamp: {
        type: Number,
      },
      attempt_count: {
        type: Number,
      },
      last_attempt_ip: {
        type: String,
      },
      last_attempt_timestamp: {
        type: Number,
      },
      is_locked: {
        type: Boolean,
        default: false,
      },
      last_locked_ip: {
        type: String,
      },
      last_locked_timestamp: {
        type: Number,
      },
    },
    wallet: {
      is_connected: {
        type: Boolean,
        default: false,
      },
      is_funded: {
        type: Boolean,
        default: false,
      },
      provider: {
        type: String,
      },
      addresses: {
        type: Array,
      },
      wap_balance: {
        type: Number,
      },
    },
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model('User', userSchema)

module.exports = User
