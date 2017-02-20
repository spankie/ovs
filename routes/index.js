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
            console.log("RESULT(>1): " + JSON.stringify(result), "\n\nOBJ:", JSON.stringify(obj), "\n\n");
            res.render('index', obj);
          }
        } else {
          obj.result = 'null';
          console.log("RESULT(No result): " + typeof result);
          res.render('index', obj);
          return;
        }
      });
    }
  });

});

router.post("/getresult/:id", function (req, res) {
  var id = parseInt(req.params.id);
  if(isNaN(id)) {
    //res.redirect('/page/viewelection/' + eId);
    res.setHeader('Content-Type', 'application/json');
    res.send({error: "not a valid election id"});
    return;
  }
  var con = mysql.createConnection(config.dbconf);

  con.connect(function(err){
    if(err){
      console.error('GET::cannot connect to database at this moment...');
      res.setHeader('Content-Type', 'application/json');
      res.send({error: "database not available"});
      return;
    } else {
      console.log('POST::conected to ' + config.dbconf.host + ':' + config.dbconf.database);
    }
  });
  
  // var can = req.body;
  con.query("SELECT * FROM candidates WHERE elect_id = ?", [id], function(err, result) {
    if (err) {
      console.error('GET::could not get candidates...');
      res.setHeader('Content-Type', 'application/json');
      res.send({error: "Could not get candidates"});
      return;
    } else {
      console.log("candidate result: ", JSON.stringify(result, null, 3))
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(result));
      return;
    }
  })

})

router.post("/getnames/:id", function (req, res) {
  var id = req.params.id;
  
  var con = mysql.createConnection(config.dbconf);

  con.connect(function(err){
    if(err){
      console.error('GET::cannot connect to database at this moment...', err);
      res.setHeader('Content-Type', 'application/json');
      res.send({error: "database not available"});
      return;
    } else {
      console.log('POST::conected to ' + config.dbconf.host + ':' + config.dbconf.database);
    }
  });

  con.query("SELECT fname, lname FROM voters WHERE v_id = ?", [id], function(err, result) {
    if(err) {
      console.error('GET::DB query error:', err);
      res.setHeader('Content-Type', 'application/json');
      res.send({error: "error in query"});
    } else {
      console.error('GET::got names', JSON.stringify(result, null, 3));
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(result));
    }
  })
})

module.exports = router;
