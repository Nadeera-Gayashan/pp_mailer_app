const express = require('express')
const config = require('./config')
const bodyParser = require('body-parser');
const nodeMailer = require('nodemailer');
const cors = require('cors');
const app = express()

app.use(cors({
  origin: '*'
}));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

const port = config.port;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/send-email', function (req, res) {
  const {image, businessName, businessAddress} = req.body;

  const transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: config.senderEmail,
      pass: config.senderPass
    }
  });
  

  let mailOptions = {
    from: config.senderEmail, // sender address
    to: config.reciverEmail, // list of receivers
    subject: 'NEW CLIENT HAS REGISTERED', // Subject line
    html: `<b>Business name: ${businessName}</b><br>
           <b>Business address: ${businessAddress}</b><br>
           <img src="${image}" alt="">` , // html body
    attachments: [
      {
        filename: 'img.jpg',
        content: image.split("base64,")[1],
        encoding: 'base64'
      }
    ]
  };

  try {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }

      console.log('Message %s sent: %s', info.messageId, info.response);

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send({
        code: 200,
        message: 'The message was sent'
      })
    });
  } catch (e) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.send({
      code: 500,
      message: 'Something went wrong with sending email'
    })
  }


});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
