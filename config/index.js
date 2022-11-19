const dotenv = require('dotenv').config()

module.exports = {
  port: process.env.PORT,
  senderEmail: process.env.SENDER_EMAIL,
  senderPass: process.env.SENDER_PASS,
  reciverEmail: process.env.RECIVER_EMAIL,
}
