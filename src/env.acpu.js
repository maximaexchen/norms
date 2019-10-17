(function(window) {
  window.__env = window.__env || {};

  // Whether or not to enable debug mode
  // Setting this to false will disable console output
  window.__env.enableDebug = false;
  window.__env.envFileLoaded = true;

  window.__env.dbBaseUrl = 'http://116.203.220.19:5984/';
  window.__env.dbName = 'norm_rep2';

  window.__env.uploadUrl = 'http://116.203.220.19:4000/api/upload';

  window.__env.uploadDir = './dist/assets/uploads/';
  window.__env.uploadRoot = './dist/';
})(this);
