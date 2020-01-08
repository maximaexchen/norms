var nano = require('nano')('http://root:root@127.0.0.1:5984');
var db = nano.db.use('norm_documents_clean');

db.compact();
