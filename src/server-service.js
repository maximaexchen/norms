/**
 * Install
 * =============================
 * npm install -g node-windows
 * cd Projektordner
 * npm link node-windows
 *
 * Setup Service
 * =============================
 * cmd (als Administrator)
 * node server-service.js
 *
 * Run
 * =============================
 * Edit Service Settings (automatic startup)
 * Start Service
 *
 */

var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name: 'ACP Normenverwaltung Uploadhandler',
  description: 'Normenverwaltung Uploader Node Service',
  script: 'D:\\ACP.extranet\\public\\acpold\\airweb\\norms\\server.js',
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function () {
  svc.start();
});

svc.install();
