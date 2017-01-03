var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var home = "Online Voting System";

var conVs = { 
  host : 'localhost',
  user : 'root',
  password : 'toor',
  database : 'vs'
};

/* GET home page. */
router.get('/', function(req, res, next) {
  var obj = { title: home }
  var con = mysql.createConnection(conVs);
  con.connect(function(err){
    if(err){
      console.error('GET::cannot connect to database at this moment...');
      obj.result = 'null';
      res.render('index', obj);
    } else {
      console.log('GET::conected to ' + conVs.host + ':' + conVs.database);
    }
  });

  con.query('SELECT * FROM `election` WHERE date BETWEEN NOW() AND NOW() + INTERVAL 24 hour OR date BETWEEN NOW() - INTERVAL 24 hour AND NOW() LIMIT 1', function(err, result){
    if(err) {
      obj.result = 'null';
      console.log("RESULT(err): " + typeof result);
      res.render('index', obj);
    } else if(result != "") {
      if(result.lenght < 1){
        obj.result = 'null';
        console.log("RESULT(<1): " + typeof result);
      } else {
        obj.result = result;
        console.log("RESULT(>1): " + typeof result);
        res.render('index', obj);
      }
    } else {
      obj.result = 'null';
      console.log("RESULT(No result): " + typeof result);
      res.render('index', obj);
    }
  });
});

module.exports = router;
