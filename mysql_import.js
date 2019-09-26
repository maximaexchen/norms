var mysql = require('mysql');
var nano = require('nano')('http://root:root@127.0.0.1:5984');

var db = nano.db.use('norm_documents');

var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password'
});

var sql =
  'SELECT id, user, firstname, lastname, email, password, active  FROM acp_visualisation.acp_user_access';

con.connect(function(err) {
  if (err) throw err;
  console.log('Connected.');
});

con.query(sql, function(err, result) {
  if (err) throw err;
  const users = [];
  result.forEach(element => {
    const user = {};
    user.type = 'user';
    user.externalID = element.id;
    user.userName = element.user;
    user.firstName = element.firstname;
    user.lastName = element.lastname;
    user.email = element.email;
    user.password = element.password;
    user.active = element.active == 1 ? true : false;

    users.push(user);
  });

  db.bulk({ docs: users }, function(err, body) {
    if (err) throw err;
  });
});

con.end();
