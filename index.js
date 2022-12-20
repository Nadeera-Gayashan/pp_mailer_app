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
  const {image, businessName, businessAddress, businessEmail} = req.body;
  console.log(req, 'req');

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
           <b>Business email: ${businessEmail}</b><br>
           <img src="${image}" alt="">` , // html body
  };

  try {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }

      const options = {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': '8j2a33rpczgpchmd45jakzdgzl1e304',
          'Access-Control-Allow-Origin': '*'
        },
        body: `[{"email": ${businessEmail} ,"first_name": ${businessName},"last_name":${businessName}]`
      };

      fetch('https://api.bigcommerce.com/stores/cvs5hyte09/v3/customers', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));

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
