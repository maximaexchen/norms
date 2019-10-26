// server.js
// https://appdividend.com/2019/06/07/angular-8-file-upload-tutorial-with-example-angular-image-upload/
const fs = require('fs-extra');
const klaw = require('klaw');
const path = require('path');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const jwt = require('jsonwebtoken');
const app = express();
let fileName = '';

const DIR = './uploads';

app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, revision, createid'
  );

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
};
app.use(allowCrossDomain);

app.post('/api/test', function(req, res) {
  return res.end('api test');
});

//middleware
function searchMiddleware(req, res, next) {
  next();
}

app.get('/api/findDirectory/:id', searchMiddleware, function(req, res) {
  var items = [];

  let dirExists = false;

  // Read all folders in upload directory
  klaw('./uploads/')
    .on('data', item => {
      items.push(item.path);
    })
    .on('end', function() {
      items.forEach(item => {
        if (item.includes(req.params.id)) {
          dirExists = true;
          return;
        }
      });

      res.json('dirExists : ' + dirExists);
    })
    .on('error', function(err, item) {
      //console.log(err.message);
      //console.log(item.path); // the file the error occurred on
    });
});

// Store file in temp directory
var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './uploadsTemp/');
  },
  filename: (req, file, callback) => {
    fileName =
      req.headers.createid +
      '-' +
      req.headers.revision +
      '.' +
      file.originalname.split('.').pop();
    callback(null, fileName);
  }
});
var upload = multer({ storage: storage }).any();

app.post('/api/upload', function(req, res) {
  upload(req, res, function(err) {
    if (err) {
      return res.end('Error uploading file: ' + err);
    } else {
      let tempPath = './' + req.files[0].path;
      let copyPath =
        req.body.uploadDir + req.body.createID + '/' + req.files[0].filename;
      // Move file in synamic generated Directory
      console.log('tempPath: ' + tempPath);
      console.log('copyPath: ' + copyPath);
      fs.move(tempPath, copyPath, function(err) {
        if (err) return console.error(err);
      });
      res.json({
        file: copyPath,
        fileName: req.files[0].filename,
        success: 'File has been uploaded'
      });
    }
  });
});

app.post('/api/auth', function(req, res) {
  const body = req.body;

  console.log(req.body);
  console.log(body);
  console.log(body.username);
  console.log(!body.username);

  if (!body.username) res.sendStatus(401);

  var privateKEY = fs.readFileSync(
    path.dirname(__filename) + '/private.key',
    'utf8'
  );
  var publicKEY = fs.readFileSync(
    path.dirname(__filename) + '/public.key',
    'utf8'
  );

  var i = 'Aircraft Philipp';
  var s = body.username;
  var a = 'https://www.aircraft-philipp.com';

  var signOptions = {
    issuer: i,
    subject: s,
    audience: a,
    expiresIn: '8h',
    algorithm: 'RS256' // RSASSA [ "RS256", "RS384", "RS512" ]
  };

  var token = jwt.sign({ userName: body.username }, privateKEY, signOptions);

  /*
 ====================   JWT Verify =====================
*/
  /*  var verifyOptions = {
    issuer: i,
    subject: s,
    audience: a,
    expiresIn: '8h',
    algorithm: ['RS256']
  };
  var legit = jwt.verify(token, publicKEY, verifyOptions); */

  res.send({ token });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, function() {
  console.log('Node.js server is running on port ' + PORT);
});

app.use(function(err, req, res, next) {
  console.log(err.fieldname);
  console.log('This is the invalid field ->', err.field);
  next(err);
});
