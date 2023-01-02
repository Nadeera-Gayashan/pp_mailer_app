const express = require('express')
const config = require('./config')
const bodyParser = require('body-parser');
const nodeMailer = require('nodemailer');
const BigCommerce = require('node-bigcommerce');

const cors = require('cors');
const app = express()

app.use(cors({
  origin: '*'
}));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

const port = config.port;

const bigCommerce = new BigCommerce({
  clientId: 'mzq0supnse4z785wmcez9ssg2dxgrjf',
  accessToken: '8j2a33rpczgpchmd45jakzdgzl1e304',
  storeHash: 'cvs5hyte09',
  responseType: 'json',
  apiVersion: 'v3' // Default is v2
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/send-email', cors(), async function (req, res) {
  const {
    image,
    businessEmail,
    password,
    buyerFirstName,
    buyerLastName,
    companyName,
    phoneNumber,
    businessAddress1,
    businessAddress2,
    city,
    state,
    zip,
    country
  } = req.body;

  const customer = [{
    'email': businessEmail,
    'first_name': buyerFirstName,
    'last_name': buyerLastName,
    "phone": phoneNumber,
    "customer_group_id": 1,
    "addresses": [
      {
        "address1": businessAddress1,
        "address2": businessAddress2,
        "city": city,
        "company": companyName,
        "country_code": "US",
        "first_name": buyerFirstName,
        "last_name": buyerLastName,
        "phone": phoneNumber,
        "postal_code": zip,
        "state_or_province": 'California',
      }
    ],
    "authentication": {
      "force_password_reset": true,
      "new_password": password
    },
  }];

  try {
    await bigCommerce.post('/customers', customer);
  } catch (err) {
    console.log(err);
    res.send({
      code: 422,
      message: 'Something went wrong'
    });
    return;
  }


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
    from: config.senderEmail,
    to: config.reciverEmail,
    subject: 'NEW CLIENT HAS REGISTERED',
    html: `<b>Customer name: ${buyerFirstName} ${buyerLastName}</b><br>
           <b>Business Name: ${companyName}</b><br>
           <b>Business address line 1: ${businessAddress1}</b><br>
           <b>Business address line 2: ${businessAddress1}</b><br>
           <b>Business email: ${businessEmail}</b><br>
           <b>Phone number: ${phoneNumber | '-'}</b><br>
           <b>Country: ${country | '-'}</b><br>
           <b>State: ${state | '-'}</b><br>
           <b>City: ${city | '-'}</b><br>
           <b>Zip: ${zip | '-'}</b><br>
           <img src="${image}" alt="">`,
  };

  try {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }

      console.log('the message was sent to: ', businessEmail);
      res.send({
        code: 200,
        message: 'The customer has created and the notification message was sent'
      });
    });
  } catch (e) {
    console.log(e)
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
