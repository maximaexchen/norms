(function(window) {
  window.__env = window.__env || {};

  // Whether or not to enable debug mode
  // Setting this to false will disable console output
  //
  window.__env.enableDebug = false;
  window.__env.envFileLoaded = true;

  window.__env.dbIP = '116.203.220.19:5984';
  window.__env.dbBaseUrl = 'http://116.203.220.19:5984/';
  window.__env.dbName = 'norm_rep2';

  window.__env.uploadUrl = 'http://192.9.155.184:4000/api/upload';
  window.__env.deleteUrl = 'http://192.9.155.184:4000/api/deleteFolder';

  window.__env.uploadDir = './assets/uploads/';
  window.__env.uploadRoot = './';

  window.__env.apiUrl = 'http://192.9.155.184:4000';
})(this);
