var mysql = require('mysql');
var nano = require('nano')('http://root:root@127.0.0.1:5984');

var db = nano.db.use('norm_documents');

var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password'
});

var key = 'type';
var value = 'user';

var sql =
  'SELECT id, user, firstname, lastname, email, password, supplier_id, levels, active ' +
  'FROM acp_visualisation.acp_user_access ' +
  'WHERE active = 1';

con.connect(function(err) {
  if (err) throw err;
  console.log('Connected.');
});

con.query(sql, function(err, result) {
  if (err) throw err;
  const users = [];

  users.push({
    type: 'user',
    externalID: '10001',
    userName: 'admin',
    firstName: 'My',
    lastName: 'Admin',
    email: 'admin@aircraft-philipp.com',
    password: '21232f297a57a5a743894a0e4a801fc3',
    role: 'admin',
    supplierId: 0,
    active: true
  });

  users.push({
    type: 'user',
    userName: 'owner',
    externalID: '10002',
    firstName: 'test',
    lastName: 'Owner',
    email: 'owner@aircraft-philipp.com',
    role: 'owner',
    supplierId: 0,
    password: '72122ce96bfec66e2396d2e25225d70a',
    active: true,
    associatedNorms: [
      {
        revisionId: '11/2009e',
        normNumber: '80-T-35-0100',
        date: '2019-12-04T08:42:53.323Z',
        confirmed: false,
        confirmedDate: '',
        normDocument: '3d38d7eb-be32-454d-87bd-ba5cb05158aa_112009e.pdf'
      }
    ]
  });

  users.push({
    type: 'user',
    userName: 'owner2',
    externalID: '10003',
    firstName: 'Zweiter',
    lastName: 'Owner',
    email: 'owner2@aircraft-philipp.com',
    role: 'owner',
    supplierId: 0,
    password: 'b1e3677cd7c6f633e6c08037583c846f',
    active: true,
    associatedNorms: []
  });

  users.push({
    type: 'user',
    userName: 'user',
    externalID: '10004',
    firstName: 'Testusers',
    lastName: 'User',
    email: 'user@aircraft-philipp.com',
    supplierId: 0,
    role: 'user',
    password: 'ee11cbb19052e40b07aac0ca060c23ee',
    active: true,
    associatedNorms: [
      {
        normId: '0c6401c7aa2d7c05631768dfc600fb9f',
        revisionId: 'Issue 6',
        normNumber: 'ZZ AG 506',
        date: '2019-11-12T10:42:40.678Z',
        confirmed: true,
        confirmedDate: '2019-11-12T12:37:06.707Z',
        normDocument: '0c6401c7aa2d7c05631768dfc600fb9f-Issue6.pdf'
      }
    ]
  });

  users.push({
    type: 'user',
    externalID: '10005',
    userName: 'externaluser',
    firstName: 'A',
    lastName: 'External',
    email: 'externaluser@aircraft-philipp.com',
    password: 'd5b65e6d96957a40bd5a033859fe380b',
    role: 'other',
    supplierId: 2,
    active: true
  });

  result.forEach(element => {
    const user = {};
    user.type = 'user';
    user.externalID = '' + element.id;
    user.userName = element.user;
    user.firstName = element.firstname;
    user.lastName = element.lastname;
    user.email = element.email;
    user.password = element.password;
    user.supplierId = element.supplier_id;
    user.levels = element.levels;
    user.active = element.active == 1 ? true : false;

    users.push(user);
  });

  db.bulk({ docs: users }, function(err, body) {
    if (err) throw err;
  });
});

con.end();

// Delete user
/* db.list(
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
 */
