(function(window) {
  window.__env = window.__env || {};

  // Whether or not to enable debug mode
  // Setting this to false will disable console output
  window.__env.enableDebug = false;
  window.__env.envFileLoaded = true;

  window.__env.dbIP = '127.0.0.1:5984';
  window.__env.dbBaseUrl = 'http://127.0.0.1:5984/';
  // window.__env.dbName = 'norm_local';
  window.__env.dbName = 'norm_documents';

  // window.__env.dbBaseUrl = 'http://192.168.178.24:8888/';
  // window.__env.dbName = 'norm_rep';

  window.__env.uploadUrl = 'http://localhost:4000/api/upload';
  window.__env.deleteUrl = 'http://localhost:4000/api/deleteFolder';
  window.__env.apiUrl = 'http://localhost:4000';

  window.__env.printPDFUrl = 'http://normenverwaltung/php/outputPDF.php';

  // window.__env.uploadDir = './dist/norms/assets/uploads/';
  // window.__env.uploadRoot = './dist/norms/';
  window.__env.uploadDir = './assets/uploads/';
  window.__env.uploadRoot = './src/';

  // ng build --prod --base-href ./
})(this);
