(function(window) {
  window.__env = window.__env || {};

  // Whether or not to enable debug mode
  // Setting this to false will disable console output
  window.__env.enableDebug = false;
  window.__env.envFileLoaded = true;

  // window.__env.dbBaseUrl = 'http://127.0.0.1:5984/';
  // window.__env.dbName = 'norm_documents';

  // window.__env.dbBaseUrl = 'http://192.168.178.24:8888/';
  // window.__env.dbName = 'norm_rep';

  window.__env.dbBaseUrl = 'http://116.203.220.19:5984/';
  window.__env.dbName = 'norm_rep2';

  // window.__env.uploadUrl = 'http://116.203.220.19:4000/api/upload';
  window.__env.uploadUrl = 'http://localhost:4000/api/upload';

  // window.__env.uploadDir = './dist/wakandaAngular/assets/uploads/';
  window.__env.uploadDir = './src/assets/uploads/';
})(this);
