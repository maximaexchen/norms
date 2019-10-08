// server.js
// https://appdividend.com/2019/06/07/angular-8-file-upload-tutorial-with-example-angular-image-upload/
const fs = require('fs-extra');
const klaw = require('klaw');
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

app.post('/api/test', function(req, res) {
  //return res.end('api test');
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
      file.originalname + '-' + Date.now() + path.extname(file.originalname);
    fileName = fileName.split(' ').join('_');
    callback(null, fileName);
  }
});
var upload = multer({ storage: storage }).any();

app.post('/api/upload', function(req, res) {
  upload(req, res, function(err) {
    if (err) {
      return res.end('Error uploading file.');
    } else {
      console.log('req.body');
      console.log(req.body);
      console.log(req.files[0].filename);
      let tempPath = './' + req.files[0].path;

      let copyPath =
        req.body.uploadDir + req.body.createID + '/' + req.files[0].filename;
      /* let copyPath =
        './dist/norms/assets/uploads/' +
        req.body.createID +
        '/' +
        req.files[0].filename; */

      // Move file in synamic generated Directory
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

const PORT = process.env.PORT || 4000;

app.listen(PORT, function() {
  console.log('Node.js server is running on port ' + PORT);
});

app.use(function(err, req, res, next) {
  console.log(err.fieldname);
  console.log('This is the invalid field ->', err.field);
  next(err);
});
