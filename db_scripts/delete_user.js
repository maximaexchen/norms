var nano = require('nano')('http://root:root@127.0.0.1:5984');
var db = nano.db.use('norm_documents');
var key = 'type';
var value = 'user';
// Delete user
db.list(
  {
    include_docs: true
  },
  function(err, body) {
    // istanbul ignore next
    if (err) console.log('Unable to fetch documents');
    // res.json({ success: false, msg: 'Unable to fetch documents' });
    else {
      var rows = body.rows;
      var items = [];
      var rec_found = false;
      rows.forEach(function(row) {
        if (row.doc[key] === value) {
          rec_found = true;
          items.push(row.doc);
        }
      });
      if (items.length === 0) {
        console.log('No record found with fkId: ' + value);
        // res.json({ success: true, msg: 'No record found with fkId: ' + value });
      } else {
        var docId = items[0]._id;
        var docRev = items[0]._rev;

        items.forEach(function(item) {
          console.log(item._id);
          console.log(item._rev);

          db.destroy(item._id, item._rev, function(err) {
            if (!err) {
              console.log('Successfully deleted doc with fkId: ' + value);
            } else {
              console.log(
                'Failed to delete with fkId from the database, please try again.'
              );
            }
          });
        });
      }
    }
  }
);
