// server.js
// https://appdividend.com/2019/06/07/angular-8-file-upload-tutorial-with-example-angular-image-upload/
const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const app = express();
let fileName = '';

const DIR = './uploads';

app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
};
app.use(allowCrossDomain);

app.get('/api', function(req, res) {
  res.end('file catcher example');
});

var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './uploads/tempDir/');
  },
  filename: (req, file, callback) => {
    fileName =
      file.originalname + '-' + Date.now() + path.extname(file.originalname);
    fileName = fileName.split(' ').join('_');
    callback(null, fileName);
  }
});
var upload = multer({ storage: storage }).any();

app.post('/api/upload', function(req, res) {
  upload(req, res, function(err) {
    if (err) {
      console.log(err);
      return res.end('Error uploading file.');
    } else {
      let tempPath = './' + req.files[0].path;
      let copyPath =
        './uploads/' + req.body.createID + '/' + req.files[0].filename;

      fs.move(tempPath, copyPath, function(err) {
        if (err) return console.error(err);
        console.log('success!');
      });

      /* req.files.forEach(function(f) {
        console.log(f);
        fs.mkdirsSync(path);
      }); */
      res.end('File has been uploaded');
    }
  });
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
