const express = require('express')
const config = require('./config')
const bodyParser = require('body-parser');
const nodeMailer = require('nodemailer');
const BigCommerce = require('node-bigcommerce');
const generateEmailBody = require('./welcomeEmail');
const cors = require('cors');
const app = express()
const multer = require('multer');

app.use(cors({
  origin: '*'
}));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

const port = config.port;

const bigCommerce = new BigCommerce({
  clientId: 's6u73s8wi9ksi329x0a6xr4c5wzcprb',
  accessToken: 't525twricsuqvefl9ob4y2872phx3t3',
  storeHash: '6at0uo0xax',
  responseType: 'json',
  apiVersion: 'v3' // Default is v2
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/send-email', cors(), multer().single('image'), async function (req, res) {
  const {
    businessEmail,
    password,
    buyerFirstName,
    buyerLastName,
    companyName,
    businessType,
    phoneNumber,
    businessAddress1,
    businessAddress2,
    city,
    state,
    zip,
    country = 'United States',
    retailCertification,
    retailCertificationState
  } = req.body;

  const file = req.file;

  const customer = [{
    'email': businessEmail,
    'first_name': buyerFirstName,
    'last_name': buyerLastName,
    "phone": phoneNumber,
    "company": companyName,
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
        "address_type": "commercial",

      }
    ],
    "authentication": {
      "force_password_reset": false,
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
    subject: 'New PPLF Wholesale Customer Application',
    html: `<b>Buyer Name: ${buyerFirstName} ${buyerLastName}</b><br>
           <b>Business Name: ${companyName}</b><br>
           <b>Business Type: ${businessType}</b><br>
           <b>Business address line 1: ${businessAddress1}</b><br>
           <b>Business address line 2: ${businessAddress2}</b><br>
           <b>Business email: ${businessEmail}</b><br>
           <b>Phone number: ${phoneNumber}</b><br>
           <b>Country: ${'United States'}</b><br>
           <b>State: ${state}</b><br>
           <b>City: ${city}</b><br>
           <b>Zip: ${zip}</b><br>
           <b>Retail Certification Number: ${retailCertification}</b><br>
           <b>Retail Certification State: ${retailCertificationState}</b><br>`,
    attachments: [
      {
        filename: file.originalname,
        content: file.buffer
      }
    ]
  };

  try {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
    });
  } catch (e) {
    console.log(e)
  }

  let welcomeMailOptions = {
    from: config.senderEmail,
    to: businessEmail,
    subject: 'Welcome to Our Site',
    html: generateEmailBody()
  };


  try {
    transporter.sendMail(welcomeMailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
    });
  } catch (e) {
    console.log(e);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
