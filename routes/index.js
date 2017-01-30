var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var config = require('../models/config');

var home = "Online Voting System";


/* GET home page. */
router.get('/', function(req, res, next) {

  // get session first. if sessio is not set, then the user is not logged in.
  // provide the vote page which contains login portal.
  var obj = { title: home }
  var con = mysql.createConnection(config.dbconf);
  con.connect(function(err){
    if(err){
      console.error('DBERROR::cannot connect to database at this moment...', err);
      obj.result = 'null';
      res.render('index', obj);
    } else {
      console.log('GET::conected to ' + config.dbconf.host + ':' + config.dbconf.database);
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
    }
  });

});

module.exports = router;
