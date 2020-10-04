const Signature = require('../models/signature');
const pdfmake = require('pdfmake');
const path = require('path');
const router = require('express').Router();

router.post('/sign', (req, res, next) => {
  if (!req.body.name)
    return res.status(409).json({
      status: false,
      message: "Name is missing"
    });
  if (!req.body.roll)
    return res.status(409).json({
      status: false,
      message: "Roll Number is missing"
    });
  if (!req.body.email)
    return res.status(409).json({
      status: false,
      message: "Email ID is missing"
    });
  if (!req.body.signBuffer)
    return res.status(409).json({
      status: false,
      message: "Signature is missing"
    });
  next();
}, (req, res, next) => {
  Signature.findOne({ roll: req.body.roll }).exec().then(rollExists => {
    if (rollExists)
      return res.status(200).json({
        status: false,
        message: "Sorry, A signature with this Roll Number already exists",
        data: rollExists
      });
    next();
  }).catch(rollCR => {
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: rollCR
    });
  });
}, (req, res, next) => {
  Signature.findOne({ email: req.body.email }).exec().then(emailExists => {
    if (emailExists)
      return res.status(200).json({
        status: false,
        message: "Sorry, A signature with this Email ID already exists",
        data: rollExists
      });
    next();
  }).catch(emailCR => {
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: emailCR
    });
  })
}, (req, res) => {
  new Signature(req.body).save().then(sign => {
    return res.status(200).json({
      status: true,
      message: "Signature Saved",
      data: sign
    });
  }).catch(error => {
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error
    });
  });
});

router.get('/getSigns', (req, res) => {
  Signature.find({}).exec().then(signs => {
    return res.status(200).json({
      status: true,
      message: "Signatures Retrieved",
      data: signs
    });
  }).catch(error => {
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error
    });
  });
});

router.get('/getSign/:roll', (req, res) => {
  Signature.findOne({ roll: req.params.roll }).exec().then(sign => {
    if (!sign)
      return res.status(200).json({
        status: false,
        message: "Signature Not Found",
        data: null
      });
    return res.status(200).json({
      status: true,
      message: "Signature Retrieved",
      data: sign
    });
  }).catch(error => {
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error
    });
  });
});

router.get('/download', (req, res) => {
  Signature.find({}).exec().then(signs => {
    let signatures = [];
    signs.forEach((sign,i) => {
      let s = sign.toJSON();
      signatures.push([
        (i+1),
        s.roll, s.name, s.email, {
          image: s.signBuffer,
          height: 50,
          width: 200
		    }
      ])
    });
    signatures.sort((s1,s2) => s1[1] - s2[1]);
    signatures.forEach((s,i) => {
      s[0] = (i+1);
    })
    var dd = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      content: [
        { text: 'Supporters\n\n', style: 'header', alignment: 'center', fontSize: 30 },
        {
          style: 'tableExample',
          alignment: 'center',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', '*'],
            body: [
              [
                { text: 'Sl. No.', bold: true, color: 'black', alignment: 'center' },
                { text: 'Roll Number', bold: true, color: 'black', alignment: 'center' },
                { text: 'Name', bold: true, color: 'black', alignment: 'center' },
                { text: 'Email ID', bold: true, color: 'black', alignment: 'center' },
                { text: 'Signature', bold: true, color: 'black', alignment: 'center' }
              ],
              ...signatures
            ]
          }
        }
      ]
    }
    var doc = new pdfmake({
      Roboto: {
        normal: path.join(__dirname, '..', 'fonts', 'Roboto-Regular.ttf'),
        bold: path.join(__dirname, '..', 'fonts', 'Roboto-Medium.ttf'),
        italics: path.join(__dirname, '..', 'fonts', 'Roboto-Italic.ttf'),
        bolditalics: path.join(__dirname, '..', 'fonts', 'Roboto-MediumItalic.ttf')
      }
    }).createPdfKitDocument(dd);
    doc.pipe(res);
    doc.end();
  }).catch(error => {
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error
    });
  });
})

module.exports = router;
